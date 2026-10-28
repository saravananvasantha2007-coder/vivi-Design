import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getStoredSupabaseConfig } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  hasCheckedAdmin: boolean;
  isFirstTimeSetup: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  registerOwner: (email: string, password: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  checkAdminStatus: (currentUser?: User | null) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState<boolean>(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(false);

  const checkAdminStatus = async (currentUser?: User | null): Promise<boolean> => {
    const activeUser = currentUser !== undefined ? currentUser : user;
    const { isConfigured } = getStoredSupabaseConfig();
    
    if (!isConfigured) {
      setIsAdmin(false);
      setHasCheckedAdmin(true);
      return false;
    }

    try {
      // 1. Try secure RPC function verify_admin_access if present in database
      if (activeUser) {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('verify_admin_access');
          if (!rpcError && rpcData && typeof rpcData === 'object') {
            const hasAccess = Boolean((rpcData as any).isAdmin);
            setIsAdmin(hasAccess);
            setHasCheckedAdmin(true);
            return hasAccess;
          }
        } catch {
          // RPC may not be installed yet; fall through to table queries
        }
      }

      // 2. Query admin_users table directly
      const { data: allAdmins, error: countError } = await supabase
        .from('admin_users')
        .select('user_id, email, role')
        .limit(10);

      // If no admin users exist at all in database
      if (!countError && (!allAdmins || allAdmins.length === 0)) {
        setIsFirstTimeSetup(true);

        // If an authenticated user is currently logged in, auto-provision them as owner
        if (activeUser) {
          try {
            await supabase.from('admin_users').insert({
              user_id: activeUser.id,
              email: activeUser.email || '',
              role: 'owner',
            });
          } catch (e) {
            console.warn('Auto-insert into admin_users note:', e);
          }
          setIsAdmin(true);
          setHasCheckedAdmin(true);
          return true;
        }

        setIsAdmin(false);
        setHasCheckedAdmin(true);
        return false;
      } else {
        setIsFirstTimeSetup(false);
      }

      if (!activeUser) {
        setIsAdmin(false);
        setHasCheckedAdmin(true);
        return false;
      }

      // Check if current user is in admin_users by user_id or email
      const matchedAdmin = allAdmins?.find(
        (a) => a.user_id === activeUser.id || (activeUser.email && a.email?.toLowerCase() === activeUser.email.toLowerCase())
      );

      if (matchedAdmin) {
        // If matched by email but user_id was different or null, update user_id
        if (matchedAdmin.user_id !== activeUser.id) {
          try {
            await supabase
              .from('admin_users')
              .update({ user_id: activeUser.id })
              .eq('email', activeUser.email);
          } catch (e) {
            console.warn('Update user_id note:', e);
          }
        }

        setIsAdmin(true);
        setHasCheckedAdmin(true);
        return true;
      }

      // Also try querying single record directly in case limit(10) didn't include it
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', activeUser.id)
        .maybeSingle();

      if (!adminError && adminRecord) {
        setIsAdmin(true);
        setHasCheckedAdmin(true);
        return true;
      }

      setIsAdmin(false);
      setHasCheckedAdmin(true);
      return false;
    } catch (err) {
      console.error('Error verifying owner authorization:', err);
      setIsAdmin(false);
      setHasCheckedAdmin(true);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    const { isConfigured } = getStoredSupabaseConfig();

    if (!isConfigured) {
      setLoading(false);
      setHasCheckedAdmin(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        checkAdminStatus(null).finally(() => {
          if (mounted) setLoading(false);
        });
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      const isOwner = await checkAdminStatus(data.user);
      if (!isOwner) {
        await supabase.auth.signOut();
        return {
          error: new Error(
            `Access Denied: The account "${email}" is not registered as an authorized owner in the admin_users database table.`
          ),
        };
      }
    }

    return { error: null };
  };

  const registerOwner = async (email: string, password: string) => {
    const cleanEmail = email.trim();

    // Check if any admin users already exist
    const { count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    // Sign up the user in Supabase Authentication
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { error };
    }

    // Check if user was created but session is null (email confirmation required)
    const needsEmailConfirmation = Boolean(data.user && !data.session);

    if (data.user) {
      // If this is the first owner OR admin_users table is empty, provision them
      if (!count || count === 0) {
        try {
          await supabase.from('admin_users').insert({
            user_id: data.user.id,
            email: data.user.email || cleanEmail,
            role: 'owner',
          });
        } catch (insertErr) {
          console.warn('admin_users provisioning note:', insertErr);
        }
      }

      if (data.session) {
        await checkAdminStatus(data.user);
      }
    }

    return { error: null, needsEmailConfirmation };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        hasCheckedAdmin,
        isFirstTimeSetup,
        login,
        registerOwner,
        resetPassword,
        logout,
        checkAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
