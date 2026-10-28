# VIVI Creations — Premium Indian Imitation Jewellery Shopping Website

**Tagline:** *"Elegance That Makes You Shine"*

A complete, high-performance, mobile-first Indian jewellery shopping website and owner inventory management system. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Authentication, Storage, and Realtime).

Customers can browse handcrafted jewellery collections and place orders with one click through **WhatsApp** with prefilled item details. The shop owner can securely log in, upload new jewellery photographs, set prices in Indian Rupees (₹), toggle stock availability, and configure festive offers.

---

## 🌟 Key Architecture & Highlights

1. **Persistent Published Website URL**
   - The shop owner shares their published website link once (e.g. on WhatsApp Status or Instagram Bio).
   - Whenever the owner uploads a new jewellery piece, changes prices, or updates stock, **all customers see the latest catalogue automatically through the same link**.
   - No redeployment or new link is ever required.

2. **Supabase Realtime Subscriptions**
   - Live synchronization on `products`, `categories`, `offers`, and `shop_settings`.
   - If a customer already has the website open when the owner adds or updates a piece, the product catalogue updates in place immediately without requiring a page reload.

3. **WhatsApp Click-to-Chat Ordering**
   - Prefills product title, price in INR (₹), product reference ID, and product link:
     ```text
     Hello VIVI Creations! ✨
     I am interested in purchasing the *Royal Peacock Kundan Choker Necklace Set* priced at *₹1,499*.
     Ref ID: royal-peacock-kundan-choker
     Product Link: https://vivicreations.com/product/royal-peacock-kundan-choker

     Is this item available for delivery? Please share the ordering and payment details. Thank you!
     ```
   - Includes fallback modal and copy options for desktop or unsupported browsers.

4. **Owner Administrative Portal (`/admin`)**
   - Secure Supabase Authentication.
   - Protected routes and Row Level Security (RLS) policies.
   - Provisioning flow for the primary owner account.
   - Add, edit, and delete products with image upload directly to the `jewellery-images` Supabase Storage bucket.
   - Multi-image angle gallery support.
   - In-stock / Out-of-stock quick toggles.
   - Festive promotions and discount management.
   - Shop profile, WhatsApp number, and business policies configuration.

5. **Luxury Indian Jewellery Brand Aesthetics**
   - Champagne gold (`#D4AF37`, `#C5A059`), Cream (`#FFFDF9`), Soft Beige, and Deep Espresso Brown (`#1F1209`).
   - Playfair Display serif typography for luxury titles paired with Plus Jakarta Sans for legibility.
   - Mobile-first responsive navigation with drawer menu.

---

## 🚀 Quick Setup & Database Initialization

### Step 1: Run Supabase SQL Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** &rarr; **New query**.
3. Open the file `supabase_schema.sql` located in this project root (or click **Copy SQL Schema** in the website's setup banner).
4. Paste the script and click **Run**.
   - This automatically creates all tables (`products`, `categories`, `product_images`, `offers`, `shop_settings`, `admin_users`).
   - Configures Row Level Security (RLS) policies.
   - Seeds initial signature categories (Necklace Sets, Earrings, Bridal, Traditional, Bangles, Rings, Accessories).
   - Creates the `jewellery-images` storage bucket and security policies.
   - Adds tables to `supabase_realtime` publication.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` or set:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(Alternatively, enter your Supabase URL & Anon Key directly via the in-browser **Connect Supabase** banner).*

### Step 3: Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser or smartphone.

### Step 4: First-Time Owner Sign Up
1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. If no owner exists yet, the screen will switch to **Setup Owner Account**.
3. Enter your owner email and password to securely claim the owner administrator role.
4. Future registrations by random public visitors will be blocked by database security rules.

---

## 📱 WhatsApp Status Sharing Tips

- **Permanent Link:** Share your store homepage (`https://yourdomain.com`) or specific product links (`https://yourdomain.com/product/necklace-set-01`) on your WhatsApp Status.
- **Cache Notice:** WhatsApp caches image link previews. When you edit a product on the site, customers who open the link will always see the fresh real-time database price and photos.

---

## 🔒 Security & Row Level Security (RLS)

- **Public Visitors:** Allowed read-only access (`SELECT`) to published products (`is_published = true`), categories, active offers, and shop settings.
- **Owner Administrator:** Only authenticated users listed in `admin_users` table can `INSERT`, `UPDATE`, or `DELETE`.
- **Storage:** Only authenticated owners can upload or delete images in the `jewellery-images` bucket; public visitors have read-only access.
