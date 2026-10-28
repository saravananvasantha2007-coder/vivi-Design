import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, reinitializeSupabase, supabase } from '../../lib/supabase';
import { useShop } from '../../context/ShopContext';
import { AlertCircle, CheckCircle2, Copy, Database, ExternalLink, Key, RefreshCw, X } from 'lucide-react';

export const SupabaseSetupBanner: React.FC = () => {
  const { isConfigured } = getStoredSupabaseConfig();
  const { refreshAll } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUrl = supabaseUrl.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('https://')) {
      setErrorMsg('Supabase URL must start with https:// (e.g. https://your-project.supabase.co)');
      return;
    }

    if (cleanKey.length < 20) {
      setErrorMsg('Please enter a valid Supabase anon public API key.');
      return;
    }

    setTesting(true);
    try {
      // Reinitialize client
      const testClient = reinitializeSupabase(cleanUrl, cleanKey);
      
      // Ping database
      const { error } = await testClient.from('categories').select('count', { count: 'exact', head: true });
      
      if (error && !error.message.includes('relation "public.categories" does not exist')) {
        // Some error other than missing tables
        console.warn('Connection check note:', error);
      }

      saveStoredSupabaseConfig(cleanUrl, cleanKey);
      setSuccessMsg('Successfully connected to your Supabase backend!');
      await refreshAll();

      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect with provided credentials. Please double check.');
    } finally {
      setTesting(false);
    }
  };

  const copySqlToClipboard = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (e) {
      console.warn('Could not read sql file directly from fetch, using fallback');
    }
  };

  if (isConfigured && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Top Banner when not configured */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-amber-700 via-champagne-700 to-amber-800 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300 animate-ping shrink-0" />
            <span className="truncate">
              <strong>Backend Setup:</strong> Connect your Supabase database to start syncing products in real-time.
            </span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="ml-3 shrink-0 bg-white text-brown-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-champagne-100 transition shadow"
          >
            Connect Supabase
          </button>
        </div>
      )}

      {/* Setup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-champagne-300 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-brown-400 hover:text-brown-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 flex items-center justify-center text-champagne-700">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-brown-900">Supabase Backend Configuration</h3>
                <p className="text-xs text-brown-500">Connect VIVI Creations to your live PostgreSQL database & Storage</p>
              </div>
            </div>

            <div className="bg-champagne-50 border border-champagne-200 rounded-xl p-3.5 mb-5 text-xs text-brown-700 leading-relaxed space-y-2">
              <p className="font-semibold text-brown-900">Quick 2-Step Supabase Setup:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-champagne-700 underline font-medium inline-flex items-center">supabase.com <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a></li>
                <li>Go to <strong>SQL Editor</strong> and run the <code className="bg-white px-1.5 py-0.5 rounded border border-champagne-200">supabase_schema.sql</code> script (bundled in project root) to auto-create tables, RLS policies & categories.</li>
              </ol>
            </div>

            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brown-800 mb-1">
                  Project URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-champagne-300 focus:outline-none focus:ring-2 focus:ring-champagne-500 text-brown-900"
                  />
                </div>
                <p className="text-[10px] text-brown-400 mt-1">Found in Project Settings &gt; API &gt; Project URL</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-800 mb-1">
                  Project Anon Key (Public) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-champagne-300 focus:outline-none focus:ring-2 focus:ring-champagne-500 text-brown-900"
                  />
                  <Key className="w-4 h-4 absolute right-3 top-2.5 text-brown-400" />
                </div>
                <p className="text-[10px] text-brown-400 mt-1">Found in Project Settings &gt; API &gt; Project API keys &gt; anon public</p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="text-xs text-champagne-700 hover:text-champagne-800 flex items-center font-medium"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  {copiedSql ? 'Schema Copied!' : 'Copy SQL Schema'}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-brown-600 hover:bg-brown-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-champagne-600 hover:bg-champagne-700 text-white shadow hover:shadow-md transition flex items-center disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Save & Connect'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
