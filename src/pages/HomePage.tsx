import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { SpecialOffersSection } from '../components/home/SpecialOffersSection';
import { ProductCard } from '../components/product/ProductCard';
import { createGeneralWhatsAppUrl } from '../lib/whatsapp';
import { Sparkles, Star, MessageCircle, ArrowRight, ShieldCheck, Heart, Sparkle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, settings, loading } = useShop();

  // Filter New Arrivals: products explicitly marked as is_new_arrival or the top 4 most recently added
  const newArrivals = products
    .filter((p) => p.is_new_arrival)
    .slice(0, 8);
  const fallbackNewArrivals = products.slice(0, 4);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : fallbackNewArrivals;

  // Filter Best Sellers: products marked as is_best_seller
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 8);

  const whatsappUrl = createGeneralWhatsAppUrl(settings, "Hello VIVI Creations! I am browsing your homepage and would like assistance choosing jewellery.");

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Special Offers (Owner-configured active offers only) */}
      <SpecialOffersSection />

      {/* New Arrivals Section */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-champagne-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Just Added</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brown-950">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-brown-600 mt-1">
              Fresh handcrafted designs straight from our artisanal workshop
            </p>
          </div>

          <Link
            to="/shop?filter=new"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-champagne-800 hover:text-champagne-950 transition group"
          >
            <span>View All New Designs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-champagne-100 p-4 flex flex-col justify-between">
                <div className="bg-cream-200 rounded-xl w-full h-48" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-cream-200 rounded w-3/4" />
                  <div className="h-4 bg-cream-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayNewArrivals.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-champagne-200 shadow-soft max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-champagne-100 text-champagne-700 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brown-900 mb-2">
              New jewellery collections are coming soon!
            </h3>
            <p className="text-xs text-brown-600 mb-6 leading-relaxed">
              Our artisans are currently crafting new bespoke imitation jewellery pieces. Tap below to chat with us directly on WhatsApp for custom requests.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#25D366] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow hover:bg-[#20ba59] transition"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Products Grid */}
        {!loading && displayNewArrivals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayNewArrivals.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Collections / Categories */}
      <FeaturedCollections />

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-champagne-200">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-1">
                <Star className="w-3.5 h-3.5 fill-champagne-700" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brown-950">
                Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-brown-600 mt-1">
                Our most adored jewellery creations loved by brides and jewellery lovers
              </p>
            </div>

            <Link
              to="/shop?filter=bestseller"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-champagne-800 hover:text-champagne-950 transition group"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        </section>
      )}

      {/* WhatsApp Custom Outfit Matching CTA Banner */}
      <section className="my-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-brown-900 via-brown-950 to-brown-900 rounded-3xl p-8 md:p-12 border-2 border-champagne-500/30 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="space-y-3 text-center md:text-left mb-6 md:mb-0 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 bg-champagne-500/20 text-champagne-300 text-xs font-semibold px-3 py-1 rounded-full border border-champagne-500/30">
              <Sparkle className="w-3.5 h-3.5" />
              <span>Personalized Styling Assistance</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-champagne-100">
              Need Jewellery to Match Your Outfit?
            </h3>
            <p className="text-xs sm:text-sm text-cream-200 leading-relaxed">
              Share a photo of your saree, lehenga, or gown directly on WhatsApp. We will help you select matching choker sets, earrings, and bangles!
            </p>
          </div>

          <a
            href={createGeneralWhatsAppUrl(settings, "Hello VIVI Creations! I would like help matching jewellery with my outfit.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl transition transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Chat With Us on WhatsApp</span>
          </a>
        </div>
      </section>

    </div>
  );
};
