import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local override
const LOCAL_URL_KEY = 'vivi_supabase_url';
const LOCAL_ANON_KEY = 'vivi_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_URL_KEY) || '' : '';
  const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_ANON_KEY) || '' : '';

  const url = storedUrl || envUrl;
  const anonKey = storedAnonKey || envAnonKey;
  const isConfigured = Boolean(
    url &&
    url.trim() !== '' &&
    !url.includes('your-project-id') &&
    anonKey &&
    anonKey.trim() !== '' &&
    !anonKey.includes('your-anon-key')
  );

  return { url: url.trim(), anonKey: anonKey.trim(), isConfigured };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_URL_KEY, url.trim());
    localStorage.setItem(LOCAL_ANON_KEY, anonKey.trim());
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_URL_KEY);
    localStorage.removeItem(LOCAL_ANON_KEY);
  }
}

// Fallback dummy client if credentials are not yet configured
const dummyUrl = 'https://placeholder-vivi-jewellery.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

const config = getStoredSupabaseConfig();

export let supabase: SupabaseClient = createClient(
  config.isConfigured ? config.url : dummyUrl,
  config.isConfigured ? config.anonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export function reinitializeSupabase(url: string, anonKey: string) {
  saveStoredSupabaseConfig(url, anonKey);
  supabase = createClient(url.trim(), anonKey.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  return supabase;
}

/**
 * Resolves an image path or URL to a valid image source.
 * Handles storage paths, full URLs, and placeholder fallbacks.
 */
export function getJewelleryImageUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) {
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }

  const { isConfigured } = getStoredSupabaseConfig();
  if (isConfigured) {
    try {
      const { data } = supabase.storage.from('jewellery-images').getPublicUrl(pathOrUrl);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } catch (e) {
      console.warn('Failed to resolve Supabase storage image:', e);
    }
  }

  return pathOrUrl;
}

/**
 * Formats a numeric price into standard Indian Rupee format (e.g. ₹1,499)
 */
export function formatINR(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) return '₹0';
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(price);
}

/**
 * Creates clean URL friendly slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats phone number into standard WhatsApp URL format
 */
export function cleanWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}
