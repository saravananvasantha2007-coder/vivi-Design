import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/product/ProductCard';
import { WhatsAppOrderButton } from '../components/common/WhatsAppOrderButton';
import { supabase, formatINR, getJewelleryImageUrl } from '../lib/supabase';
import { Product } from '../types';
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle, Share2, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, settings, loading: shopLoading } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slug) return;
      setLoading(true);

      // Check if product is already in shop context
      const foundInContext = products.find(
        (p) => p.slug === slug || p.id === slug
      );

      if (foundInContext) {
        setProduct(foundInContext);
        setLoading(false);
        return;
      }

      // Otherwise fetch directly from Supabase by slug or id
      try {
        const query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            images:product_images(*)
          `);

        // Check if slug is a valid UUID or text slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const { data, error } = isUuid
          ? await query.eq('id', slug).single()
          : await query.eq('slug', slug).single();

        if (!error && data && isMounted) {
          setProduct(data as Product);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, products]);

  // Reset active image on product change
  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product?.name || 'Jewellery'} | ${settings.shop_name}`,
          text: `Take a look at this beautiful jewellery piece from ${settings.shop_name}!`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link');
    }
  };

  if (loading || shopLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-champagne-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-brown-700">Loading jewellery details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-champagne-200 shadow-soft">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-brown-950 mb-2">Jewellery Not Found</h2>
          <p className="text-xs text-brown-600 mb-6">
            This design might have been updated, sold, or moved to another collection.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-champagne-600 hover:bg-champagne-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </Link>
        </div>
      </div>
    );
  }

  // Combine main image and additional gallery images
  const allImages = [
    product.image_url,
    ...(product.images?.map((img) => img.image_path) || []),
  ].filter(Boolean);

  const currentDisplayImage = getJewelleryImageUrl(allImages[activeImageIndex] || product.image_url);

  // Discount calculation
  let discountPercentage = 0;
  if (product.original_price && product.original_price > product.price) {
    discountPercentage = Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    );
  }

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-cream-50 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-champagne-200">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brown-700 hover:text-champagne-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2 text-xs text-brown-500">
            <Link to="/" className="hover:text-brown-900 transition">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-brown-900 transition">Shop</Link>
            {product.category?.name && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${product.category_id}`} className="hover:text-brown-900 transition font-medium text-champagne-800">
                  {product.category.name}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white rounded-3xl p-6 sm:p-10 border border-champagne-200/90 shadow-soft mb-16">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] bg-cream-100 rounded-2xl overflow-hidden border border-champagne-200 shadow-inner group">
              <img
                src={currentDisplayImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.is_new_arrival && (
                  <span className="bg-champagne-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-champagne-200" />
                    <span>New Arrival</span>
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="bg-brown-900 text-champagne-300 text-xs font-bold px-3 py-1 rounded-full shadow border border-champagne-400/30">
                    Best Seller
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Stock Status Badge */}
              <div className="absolute bottom-4 left-4 z-10">
                {product.available ? (
                  <span className="inline-flex items-center space-x-1.5 bg-white/95 backdrop-blur-sm text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In Stock &bull; Ready to Ship</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 bg-brown-900/95 backdrop-blur-sm text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Currently Sold Out (Inquire for Restock)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel / Selector (if multiple photos available) */}
            {allImages.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => {
                  const resolvedThumb = getJewelleryImageUrl(img);
                  const isSelected = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        isSelected
                          ? 'border-champagne-600 ring-2 ring-champagne-400 shadow-md'
                          : 'border-champagne-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolvedThumb}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Column: Product Information & Ordering */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Sharing */}
              <div className="flex items-center justify-between">
                {product.category?.name ? (
                  <Link
                    to={`/shop?category=${product.category_id}`}
                    className="text-xs font-bold tracking-widest uppercase text-champagne-700 bg-champagne-100/70 px-3 py-1 rounded-full hover:bg-champagne-200 transition"
                  >
                    {product.category.name}
                  </Link>
                ) : <span />}

                <button
                  onClick={handleShare}
                  className="inline-flex items-center space-x-1 text-xs text-brown-600 hover:text-champagne-800 bg-cream-100 hover:bg-champagne-100 px-3 py-1.5 rounded-full transition border border-champagne-200 font-medium"
                  title="Share link on WhatsApp Status"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp Status</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brown-950 leading-tight">
                {product.name}
              </h1>

              {/* Price & Savings */}
              <div className="p-4 rounded-2xl bg-cream-50/80 border border-champagne-200/80 flex items-baseline space-x-3">
                <span className="font-serif text-3xl font-extrabold text-brown-950">
                  {formatINR(product.price)}
                </span>

                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-base text-brown-400 line-through">
                      {formatINR(product.original_price)}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Save {formatINR(product.original_price - product.price)} ({discountPercentage}% OFF)
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-sm font-bold text-brown-900 uppercase tracking-wider">
                  Product Description
                </h3>
                <p className="text-xs sm:text-sm text-brown-700 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    'Exquisite handcrafted Indian imitation jewellery crafted with high quality gold plating, semi-precious stones, and meticulous finish. Perfect for weddings, festivals, and parties.'}
                </p>
              </div>

              {/* Product Specifications & Trust Highlights */}
              <div className="pt-4 border-t border-champagne-100 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-cream-50 rounded-xl border border-champagne-100">
                    <span className="text-brown-400 block text-[11px]">Material & Finish</span>
                    <span className="font-semibold text-brown-900">High Grade Brass / Micro Gold Plated</span>
                  </div>
                  <div className="p-3 bg-cream-50 rounded-xl border border-champagne-100">
                    <span className="text-brown-400 block text-[11px]">Stock Status</span>
                    <span className={`font-semibold ${product.available ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {product.available ? 'Available for dispatch' : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-brown-600 pt-2">
                  <Truck className="w-4 h-4 text-champagne-700 shrink-0" />
                  <span>{settings.shipping_info}</span>
                </div>
              </div>

            </div>

            {/* WhatsApp Order Action Box */}
            <div className="mt-8 pt-6 border-t-2 border-champagne-200">
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-4 sm:p-5">
                <p className="text-xs font-bold text-brown-900 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Order Directly on WhatsApp</span>
                </p>
                <p className="text-[11px] text-brown-600 mb-4 leading-relaxed">
                  Click below to chat with the shop owner. We will prefill the product details, verify availability for your delivery pincode, and guide you through payment.
                </p>

                <WhatsAppOrderButton
                  product={product}
                  settings={settings}
                  className="w-full py-3.5 text-sm font-bold shadow-lg"
                  label="Click Here to Order on WhatsApp"
                />
              </div>

              <p className="text-[10px] text-brown-400 mt-3 text-center">
                Ref ID: <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-brown-700">{product.slug || product.id}</code> &bull; 100% Authentic Photos
              </p>
            </div>

          </div>

        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-champagne-200">
              <h2 className="font-serif text-2xl font-bold text-brown-950">
                You May Also Like
              </h2>
              {product.category?.id && (
                <Link
                  to={`/shop?category=${product.category.id}`}
                  className="text-xs font-bold text-champagne-800 hover:text-champagne-950 transition"
                >
                  View More {product.category.name} &rsaquo;
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} settings={settings} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
