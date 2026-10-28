import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { createGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { Sparkles, ArrowRight, MessageCircle, Crown, Diamond } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { settings } = useShop();
  const whatsappUrl = createGeneralWhatsAppUrl(settings);

  return (
    <div className="relative bg-gradient-to-b from-cream-100 via-cream-50 to-white overflow-hidden border-b border-champagne-200">
      {/* Decorative Gold Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-champagne-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-champagne-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 bg-champagne-100/80 border border-champagne-300/70 px-4 py-1.5 rounded-full shadow-sm">
              <Crown className="w-4 h-4 text-champagne-700" />
              <span className="text-xs font-semibold uppercase tracking-widest text-champagne-800">
                Royal Indian Imitation Jewellery
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brown-950 tracking-tight leading-[1.15]">
              Discover Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-champagne-600 via-amber-700 to-champagne-800 bg-clip-text text-transparent">
                Perfect Jewellery
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-brown-700 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Beautiful jewellery for every special moment. Handcrafted bridal sets, exquisite necklace collections, and timeless temple jewellery delivered with care.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white font-semibold px-8 py-3.5 rounded-full shadow-gold hover:shadow-gold-lg transition transform hover:-translate-y-0.5 text-sm tracking-wide"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop?filter=new"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-champagne-50 text-brown-900 border border-champagne-300 font-semibold px-7 py-3.5 rounded-full shadow-sm hover:shadow transition text-sm"
              >
                <Sparkles className="w-4 h-4 text-champagne-600" />
                <span>New Arrivals</span>
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold px-6 py-3.5 rounded-full shadow-md transition text-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-champagne-200/80 max-w-lg mx-auto lg:mx-0 text-center">
              <div>
                <p className="font-serif font-bold text-brown-900 text-base sm:text-lg">Premium</p>
                <p className="text-[11px] text-brown-500 uppercase tracking-wider">Gold Finish</p>
              </div>
              <div className="border-x border-champagne-200">
                <p className="font-serif font-bold text-brown-900 text-base sm:text-lg">Direct Chat</p>
                <p className="text-[11px] text-brown-500 uppercase tracking-wider">Fast Response</p>
              </div>
              <div>
                <p className="font-serif font-bold text-brown-900 text-base sm:text-lg">Pan India</p>
                <p className="text-[11px] text-brown-500 uppercase tracking-wider">Safe Delivery</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Visual Frame */}
            <div className="relative w-full max-w-md">
              
              {/* Outer decorative gold ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-champagne-300 via-champagne-500 to-amber-600 rounded-3xl blur-md opacity-30 transform rotate-1 group-hover:rotate-0 transition duration-500" />
              
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-cream-100 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80"
                  alt="VIVI Creations Handcrafted Indian Imitation Jewellery"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Floating Overlay Badge: Live Stock */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-champagne-200 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-champagne-100 flex items-center justify-center text-champagne-700">
                    <Diamond className="w-4 h-4" />
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-[10px] font-bold text-champagne-800 uppercase tracking-wider">Authentic Finish</p>
                    <p className="text-xs font-semibold text-brown-900">100% Quality Checked</p>
                  </div>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-brown-950/85 backdrop-blur-md text-white p-3.5 rounded-2xl border border-champagne-400/30 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-champagne-300 font-medium">New Festive Collection</p>
                    <p className="font-serif text-sm font-bold text-cream-50">Bridal & Temple Sets</p>
                  </div>
                  <Link
                    to="/shop"
                    className="bg-champagne-500 hover:bg-champagne-600 text-brown-950 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow"
                  >
                    Explore &rsaquo;
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
