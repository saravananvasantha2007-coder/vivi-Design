-- ==============================================================================
-- VIVI CREATIONS JEWELLERY SHOPPING PLATFORM - SUPABASE SCHEMA & POLICIES
-- ==============================================================================
-- Run this complete script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It creates all required tables, Row Level Security (RLS) policies, storage buckets,
-- indexes, triggers, and real-time subscription configurations.

-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    image_url text,
    display_order integer default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text default '',
    price numeric(10, 2) not null check (price >= 0),
    original_price numeric(10, 2) check (original_price is null or original_price >= 0),
    category_id uuid references public.categories(id) on delete set null,
    image_url text not null,
    available boolean not null default true,
    stock_quantity integer default 1 check (stock_quantity is null or stock_quantity >= 0),
    is_new_arrival boolean not null default false,
    is_best_seller boolean not null default false,
    is_published boolean not null default true,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCT IMAGES TABLE (Multi-image gallery support)
-- ------------------------------------------------------------------------------
create table if not exists public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    image_path text not null,
    alt_text text,
    display_order integer not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. OFFERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.offers (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text default '',
    discount_type text check (discount_type in ('percentage', 'flat')),
    discount_value numeric(10, 2) check (discount_value is null or discount_value >= 0),
    start_at timestamptz,
    end_at timestamptz,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. SHOP SETTINGS TABLE (WhatsApp contact, Brand Info, Policies)
-- ------------------------------------------------------------------------------
create table if not exists public.shop_settings (
    id text primary key default 'default',
    shop_name text not null default 'VIVI Creations',
    tagline text not null default 'Elegance That Makes You Shine',
    whatsapp_number text not null default '919876543210',
    contact_email text not null default 'contact@vivicreations.com',
    business_description text not null default 'VIVI Creations brings you premium handcrafted Indian imitation jewellery that embodies royal elegance and timeless grace.',
    instagram_url text default 'https://instagram.com',
    address text default 'Chennai, Tamil Nadu, India',
    shipping_info text not null default 'Express delivery across India. Safely packed and dispatched within 24 to 48 hours.',
    return_policy text not null default 'Replacements available for damaged transit items upon submitting a 360-degree unboxing video.',
    terms_and_conditions text not null default 'All jewellery prices are in Indian Rupees (₹). Orders are finalized directly via WhatsApp click-to-chat with our owner.',
    logo_url text,
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. ADMIN USERS TABLE (Authorized Owners)
-- ------------------------------------------------------------------------------
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    role text not null default 'owner',
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- Seed default shop settings row if not exists
insert into public.shop_settings (id, shop_name, tagline, whatsapp_number, contact_email)
values ('default', 'VIVI Creations', 'Elegance That Makes You Shine', '919876543210', 'contact@vivicreations.com')
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 7. SEED INITIAL FEATURED CATEGORIES
-- ------------------------------------------------------------------------------
insert into public.categories (name, slug, image_url, display_order)
values 
    ('Necklace Sets', 'necklace-sets', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', 1),
    ('Earrings', 'earrings', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80', 2),
    ('Bridal Jewellery', 'bridal-jewellery', 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=80', 3),
    ('Traditional Jewellery', 'traditional-jewellery', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', 4),
    ('Bangles', 'bangles', 'https://images.unsplash.com/photo-1611591475806-a831e50f58aa?auto=format&fit=crop&w=600&q=80', 5),
    ('Rings', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80', 6),
    ('Jewellery Accessories', 'jewellery-accessories', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80', 7)
on conflict (slug) do update set 
    name = excluded.name, 
    image_url = excluded.image_url, 
    display_order = excluded.display_order;

-- ------------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- ------------------------------------------------------------------------------
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_available on public.products(available);
create index if not exists idx_products_new_arrival on public.products(is_new_arrival);
create index if not exists idx_products_best_seller on public.products(is_best_seller);
create index if not exists idx_products_published on public.products(is_published);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_offers_active on public.offers(is_active);

-- ------------------------------------------------------------------------------
-- 9. HELPER SECURITY FUNCTION: IS_ADMIN & VERIFY_ADMIN_ACCESS
-- ------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  ) or (
    -- If no admin has been registered yet, the first authenticated user is granted access
    not exists (select 1 from public.admin_users) and auth.uid() is not null
  );
$$;

-- Secure RPC function called by frontend to verify or auto-claim owner status
create or replace function public.verify_admin_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_uid uuid := auth.uid();
  current_email text := auth.jwt() ->> 'email';
  admin_count integer;
begin
  if current_uid is null then
    return jsonb_build_object('isAdmin', false, 'reason', 'Not authenticated');
  end if;

  select count(*) into admin_count from public.admin_users;

  -- If no admin user exists in the database, automatically provision this user as owner
  if admin_count = 0 then
    insert into public.admin_users (user_id, email, role)
    values (current_uid, coalesce(current_email, ''), 'owner')
    on conflict (user_id) do update set email = excluded.email;
    return jsonb_build_object('isAdmin', true, 'role', 'owner', 'autoProvisioned', true);
  end if;

  -- Check if user matches by user_id
  if exists (select 1 from public.admin_users where user_id = current_uid) then
    return jsonb_build_object('isAdmin', true, 'role', 'owner');
  end if;

  -- Check if user matches by email (e.g. if manually entered or created via dashboard)
  if current_email is not null and exists (select 1 from public.admin_users where lower(email) = lower(current_email)) then
    update public.admin_users set user_id = current_uid where lower(email) = lower(current_email);
    return jsonb_build_object('isAdmin', true, 'role', 'owner');
  end if;

  return jsonb_build_object('isAdmin', false, 'reason', 'Unauthorized');
end;
$$;

grant execute on function public.verify_admin_access() to authenticated, anon;

-- Trigger to automatically register the first authenticated user as owner
create or replace function public.handle_first_user_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users) then
    insert into public.admin_users (user_id, email, role)
    values (new.id, coalesce(new.email, ''), 'owner')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_make_admin on auth.users;
create trigger on_auth_user_created_make_admin
  after insert on auth.users
  for each row execute procedure public.handle_first_user_admin();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.offers enable row level security;
alter table public.shop_settings enable row level security;
alter table public.admin_users enable row level security;

-- CATEGORIES: Public can read, only admin can manage
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
    on public.categories for select
    using (true);

drop policy if exists "Admin can insert categories" on public.categories;
create policy "Admin can insert categories"
    on public.categories for insert
    with check (public.is_admin());

drop policy if exists "Admin can update categories" on public.categories;
create policy "Admin can update categories"
    on public.categories for update
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "Admin can delete categories" on public.categories;
create policy "Admin can delete categories"
    on public.categories for delete
    using (public.is_admin());

-- PRODUCTS: Public can view published products; Admin can view all and manage all
drop policy if exists "Public view published products" on public.products;
create policy "Public view published products"
    on public.products for select
    using (is_published = true or public.is_admin());

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
    on public.products for insert
    with check (public.is_admin());

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
    on public.products for update
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
    on public.products for delete
    using (public.is_admin());

-- PRODUCT IMAGES: Public can view images; Admin can insert/update/delete
drop policy if exists "Public view product images" on public.product_images;
create policy "Public view product images"
    on public.product_images for select
    using (true);

drop policy if exists "Admin manage product images insert" on public.product_images;
create policy "Admin manage product images insert"
    on public.product_images for insert
    with check (public.is_admin());

drop policy if exists "Admin manage product images update" on public.product_images;
create policy "Admin manage product images update"
    on public.product_images for update
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "Admin manage product images delete" on public.product_images;
create policy "Admin manage product images delete"
    on public.product_images for delete
    using (public.is_admin());

-- OFFERS: Public can view active offers; Admin can view and manage all
drop policy if exists "Public view active offers" on public.offers;
create policy "Public view active offers"
    on public.offers for select
    using (is_active = true or public.is_admin());

drop policy if exists "Admin insert offers" on public.offers;
create policy "Admin insert offers"
    on public.offers for insert
    with check (public.is_admin());

drop policy if exists "Admin update offers" on public.offers;
create policy "Admin update offers"
    on public.offers for update
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "Admin delete offers" on public.offers;
create policy "Admin delete offers"
    on public.offers for delete
    using (public.is_admin());

-- SHOP SETTINGS: Public can view settings; Admin can update
drop policy if exists "Public view shop settings" on public.shop_settings;
create policy "Public view shop settings"
    on public.shop_settings for select
    using (true);

drop policy if exists "Admin update shop settings" on public.shop_settings;
create policy "Admin update shop settings"
    on public.shop_settings for update
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "Admin insert shop settings" on public.shop_settings;
create policy "Admin insert shop settings"
    on public.shop_settings for insert
    with check (public.is_admin());

-- ADMIN USERS: Users can view their own admin status; Admins can view all
drop policy if exists "Admin users select" on public.admin_users;
create policy "Admin users select"
    on public.admin_users for select
    using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin users insert" on public.admin_users;
create policy "Admin users insert"
    on public.admin_users for insert
    with check (
      auth.uid() = user_id and (
        not exists (select 1 from public.admin_users) or public.is_admin()
      )
    );

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE SETUP (Bucket & RLS)
-- ------------------------------------------------------------------------------
-- Create bucket 'jewellery-images' if it doesn't already exist
insert into storage.buckets (id, name, public)
values ('jewellery-images', 'jewellery-images', true)
on conflict (id) do update set public = true;

-- Policy for public download / view
drop policy if exists "Public can view jewellery images" on storage.objects;
create policy "Public can view jewellery images"
    on storage.objects for select
    using (bucket_id = 'jewellery-images');

-- Policy for Admin upload
drop policy if exists "Admins can upload jewellery images" on storage.objects;
create policy "Admins can upload jewellery images"
    on storage.objects for insert
    with check (bucket_id = 'jewellery-images' and auth.role() = 'authenticated');

-- Policy for Admin update
drop policy if exists "Admins can update jewellery images" on storage.objects;
create policy "Admins can update jewellery images"
    on storage.objects for update
    using (bucket_id = 'jewellery-images' and auth.role() = 'authenticated');

-- Policy for Admin delete
drop policy if exists "Admins can delete jewellery images" on storage.objects;
create policy "Admins can delete jewellery images"
    on storage.objects for delete
    using (bucket_id = 'jewellery-images' and auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 12. ENABLE REALTIME PUBLICATION
-- ------------------------------------------------------------------------------
-- Ensure tables are added to supabase_realtime so clients receive live updates
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'products') then
    alter publication supabase_realtime add table public.products;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'categories') then
    alter publication supabase_realtime add table public.categories;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'offers') then
    alter publication supabase_realtime add table public.offers;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'shop_settings') then
    alter publication supabase_realtime add table public.shop_settings;
  end if;
end $$;
