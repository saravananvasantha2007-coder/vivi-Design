export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  display_order?: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
  alt_text?: string | null;
  display_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  category_id?: string | null;
  image_url: string;
  available: boolean;
  stock_quantity?: number | null;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type?: 'percentage' | 'flat' | null;
  discount_value?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  tagline: string;
  whatsapp_number: string;
  contact_email: string;
  business_description: string;
  instagram_url?: string | null;
  address?: string | null;
  shipping_info: string;
  return_policy: string;
  terms_and_conditions: string;
  logo_url?: string | null;
  updated_at?: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  role: string;
  created_at?: string;
}
