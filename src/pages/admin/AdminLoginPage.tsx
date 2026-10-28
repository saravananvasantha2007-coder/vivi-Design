import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStoredSupabaseConfig } from '../../lib/supabase';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Key,
  UserPlus,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerOwner, resetPassword, isFirstTimeSetup, user, isAdmin, loading } = useAuth();
  const { isConfigured } = getStoredSupabaseConfig();

  const [mode, setMode] = useState<AuthMode>(isFirstTimeSetup ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCredentialError, setIsCredentialError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in and owner, redirect to admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  // Adjust default mode when isFirstTimeSetup is detected
  useEffect(() => {
    if (isFirstTimeSetup) {
      setMode('register');
    }
  }, [isFirstTimeSetup]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setIsCredentialError(false);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsCredentialError(false);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg('Please configure your Supabase URL & Anon Key first (see the top setup banner).');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // 1. FORGOT PASSWORD MODE
    if (mode === 'forgot') {
      setSubmitting(true);
      const { error } = await resetPassword(email);
      setSubmitting(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          `Password reset link sent to "${email.trim()}". Please check your inbox or spam folder.`
        );
      }
      return;
    }

    // 2. REGISTER OWNER MODE
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify both password fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters long.');
        return;
      }

      setSubmitting(true);
      const { error, needsEmailConfirmation } = await registerOwner(email, password);
      setSubmitting(false);

      if (error) {
        setErrorMsg(error.message);
      } else if (needsEmailConfirmation) {
        setSuccessMsg(
          `Owner account created! A confirmation email has been dispatched to ${email.trim()}. Please verify your email before signing in (or disable "Confirm email" in Supabase Auth -> Providers -> Email).`
        );
      } else {
        setSuccessMsg('Owner account created successfully! Redirecting to owner dashboard...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      }
      return;
    }

    // 3. SIGN IN MODE
    setSubmitting(true);
    const { error } = await login(email, password);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      if (
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid_grant')
      ) {
        setIsCredentialError(true);
      }
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brown-600 hover:text-brown-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to VIVI Creations</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-soft">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-champagne-400 to-amber-600 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-brown-900 rounded-2xl flex items-center justify-center text-champagne-300">
                <Shield className="w-7 h-7" />
              </div>
            </div>
            <h1 className="font-serif text-2xl font-bold text-brown-950">
              {mode === 'register'
                ? 'Register Owner Account'
                : mode === 'forgot'
                ? 'Reset Owner Password'
                : 'Owner Admin Portal'}
            </h1>
            <p className="text-xs text-brown-500 mt-1">
              {mode === 'register'
                ? 'Provision your owner credentials in Supabase'
                : mode === 'forgot'
                ? 'We will send a secure password reset link to your email'
                : 'Manage jewellery inventory, rupee prices & customer offers'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-cream-100 p-1 mb-6 border border-champagne-200">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-brown-900 text-champagne-200 shadow-sm'
                  : 'text-brown-700 hover:text-brown-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'register'
                  ? 'bg-brown-900 text-champagne-200 shadow-sm'
                  : 'text-brown-700 hover:text-brown-950'
              }`}
            >
              Register Owner
            </button>
          </div>

          {/* Not Configured Banner */}
          {!isConfigured && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Supabase backend connection is required. Use the top banner or configuration dialog to connect your Supabase database.
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>

              {/* Actionable Diagnostics when "Invalid login credentials" occurs */}
              {isCredentialError && (
                <div className="pl-6 pt-1 text-[11px] text-rose-800 border-t border-rose-200/80 space-y-1">
                  <p className="font-bold text-rose-900">Why did this happen?</p>
                  <p>1. If you haven't created your owner account yet, click <button type="button" onClick={() => switchMode('register')} className="underline font-bold text-rose-950 hover:text-black">Register Owner</button> above to create it.</p>
                  <p>2. If you already created it in Supabase, verify the password or check if <strong>"Confirm email"</strong> is enabled in your Supabase project (Authentication &gt; Providers &gt; Email).</p>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1.5">
                Owner Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="owner@vivicreations.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 text-brown-900 bg-cream-50/40"
                />
                <Mail className="w-4 h-4 text-brown-400 absolute left-3 top-3" />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] font-semibold text-champagne-700 hover:text-champagne-900 underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 text-brown-900 bg-cream-50/40"
                  />
                  <Lock className="w-4 h-4 text-brown-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brown-400 hover:text-brown-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 text-brown-900 bg-cream-50/40"
                  />
                  <Lock className="w-4 h-4 text-brown-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Owner Account</span>
                </>
              ) : mode === 'forgot' ? (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Reset Email</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In as Owner</span>
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs font-semibold text-champagne-800 hover:underline"
              >
                &larr; Back to Sign In
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-champagne-200 text-center">
            <p className="text-[11px] text-brown-500 leading-relaxed">
              Protected by Supabase Authentication &amp; Row Level Security. Only authorized shop owners can access inventory and pricing controls.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
