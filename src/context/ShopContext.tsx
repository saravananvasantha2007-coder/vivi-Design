import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, getStoredSupabaseConfig } from '../lib/supabase';
import { Product, Category, Offer, ShopSettings } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  offers: Offer[];
  settings: ShopSettings;
  loading: boolean;
  realtimeConnected: boolean;
  lastUpdated: Date | null;
  refreshAll: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchOffers: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettingsState: (newSettings: Partial<ShopSettings>) => void;
  recentLiveUpdate: string | null;
  clearLiveUpdateToast: () => void;
}

const defaultSettings: ShopSettings = {
  id: 'default',
  shop_name: 'VIVI Creations',
  tagline: 'Elegance That Makes You Shine',
  whatsapp_number: '919876543210',
  contact_email: 'contact@vivicreations.com',
  business_description: 'VIVI Creations brings you premium handcrafted Indian imitation jewellery that embodies royal elegance and timeless grace. Each piece is meticulously designed to make your special moments unforgettable.',
  instagram_url: 'https://instagram.com/vivicreations',
  address: 'Chennai, Tamil Nadu, India',
  shipping_info: 'We provide express, tracked shipping all across India. Every parcel is safely bubble-wrapped and dispatched within 24 to 48 hours of order confirmation.',
  return_policy: 'We guarantee genuine quality. In the rare case of transit damage, please provide a clear 360-degree unboxing video within 24 hours of delivery for an instant replacement.',
  terms_and_conditions: 'All prices shown are in Indian Rupees (₹). Availability and orders are finalized directly through WhatsApp click-to-chat with the shop owner.',
  logo_url: null,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentLiveUpdate, setRecentLiveUpdate] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchSettings = useCallback(async () => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (!isConfigured) return;

    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        setSettings({
          ...defaultSettings,
          ...data,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch shop settings:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (!isConfigured) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (!isConfigured) return;

    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOffers(data);
      }
    } catch (err) {
      console.warn('Failed to fetch offers:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (!isConfigured) {
      setProducts([]);
      return;
    }

    try {
      // Query published products with their category details and additional product images
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
        setLastUpdated(new Date());
      } else if (error) {
        console.error('Error fetching products from Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to load jewellery catalogue:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchProducts(),
      fetchCategories(),
      fetchOffers(),
      fetchSettings(),
    ]);
    setLoading(false);
  }, [fetchProducts, fetchCategories, fetchOffers, fetchSettings]);

  // Initial load
  useEffect(() => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (isConfigured) {
      refreshAll();
    } else {
      setLoading(false);
    }
  }, [refreshAll]);

  // Realtime Subscriptions with Supabase Realtime
  useEffect(() => {
    const { isConfigured } = getStoredSupabaseConfig();
    if (!isConfigured) return;

    // Clean up any existing channel before subscribing
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel('vivi_public_realtime_channel')
      // Products Realtime: INSERT, UPDATE, DELETE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          console.log('Realtime product update received:', payload.eventType, payload.new);
          
          if (payload.eventType === 'INSERT') {
            const newProd = payload.new as Product;
            if (newProd.is_published) {
              // Fetch full product details including joined category and images
              const { data } = await supabase
                .from('products')
                .select(`
                  *,
                  category:categories(*),
                  images:product_images(*)
                `)
                .eq('id', newProd.id)
                .single();

              if (data) {
                setProducts((prev) => {
                  if (prev.some((p) => p.id === data.id)) return prev;
                  return [data as Product, ...prev];
                });
                setRecentLiveUpdate(`✨ New jewellery added: "${data.name}"`);
                setLastUpdated(new Date());
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Product;
            if (!updated.is_published) {
              // If owner unpublished the product, remove from customer catalogue
              setProducts((prev) => prev.filter((p) => p.id !== updated.id));
              setRecentLiveUpdate(`Catalogue updated`);
            } else {
              // Re-fetch complete joined data for the updated product
              const { data } = await supabase
                .from('products')
                .select(`
                  *,
                  category:categories(*),
                  images:product_images(*)
                `)
                .eq('id', updated.id)
                .single();

              if (data) {
                setProducts((prev) => {
                  const exists = prev.some((p) => p.id === data.id);
                  if (exists) {
                    return prev.map((p) => (p.id === data.id ? (data as Product) : p));
                  } else {
                    return [data as Product, ...prev];
                  }
                });
                setRecentLiveUpdate(`💎 Updated product: "${data.name}"`);
              }
            }
            setLastUpdated(new Date());
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId) {
              setProducts((prev) => prev.filter((p) => p.id !== oldId));
              setLastUpdated(new Date());
            }
          }
        }
      )
      // Offers Realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          fetchOffers();
        }
      )
      // Categories Realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories();
        }
      )
      // Shop Settings Realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shop_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
          // Try re-fetching catalogue when connection is re-established
          fetchProducts();
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchProducts, fetchOffers, fetchCategories, fetchSettings]);

  const updateSettingsState = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const clearLiveUpdateToast = () => setRecentLiveUpdate(null);

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        offers,
        settings,
        loading,
        realtimeConnected,
        lastUpdated,
        refreshAll,
        fetchProducts,
        fetchCategories,
        fetchOffers,
        fetchSettings,
        updateSettingsState,
        recentLiveUpdate,
        clearLiveUpdateToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
