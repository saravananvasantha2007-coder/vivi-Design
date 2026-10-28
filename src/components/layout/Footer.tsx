import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { createGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { Sparkles, MessageCircle, Mail, MapPin, Instagram, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories } = useShop();
  const whatsappUrl = createGeneralWhatsAppUrl(settings);

  return (
    <footer className="bg-brown-950 text-cream-200 border-t-2 border-champagne-500/40 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-brown-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4 p-4 rounded-xl bg-brown-900/40 border border-champagne-500/10">
            <div className="w-12 h-12 rounded-full bg-champagne-500/20 text-champagne-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-champagne-200 text-sm">Artisanal Craftsmanship</h4>
              <p className="text-xs text-cream-300 mt-1 leading-relaxed">
                Handpicked premium Indian imitation jewellery with superior gold finishing and intricate stone settings.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4 p-4 rounded-xl bg-brown-900/40 border border-champagne-500/10">
            <div className="w-12 h-12 rounded-full bg-champagne-500/20 text-champagne-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-champagne-200 text-sm">Direct WhatsApp Ordering</h4>
              <p className="text-xs text-cream-300 mt-1 leading-relaxed">
                Personalized customer service. Check live stock, match with your outfit, and confirm securely.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4 p-4 rounded-xl bg-brown-900/40 border border-champagne-500/10">
            <div className="w-12 h-12 rounded-full bg-champagne-500/20 text-champagne-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-champagne-200 text-sm">Safe All-India Shipping</h4>
              <p className="text-xs text-cream-300 mt-1 leading-relaxed">
                Sturdy protective packaging ensures your delicate ornaments arrive in immaculate pristine condition.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-champagne-500/30 flex items-center justify-center text-champagne-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-wide text-white">
                {settings.shop_name || 'VIVI Creations'}
              </span>
            </div>
            <p className="text-xs text-cream-300 leading-relaxed">
              {settings.business_description || 'Elegance That Makes You Shine. High quality Indian imitation jewellery for weddings, celebrations, and festive occasions.'}
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Jewellery Categories */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider text-champagne-400 uppercase mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-300">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/shop?category=${cat.id}`}
                    className="hover:text-champagne-300 transition flex items-center space-x-1"
                  >
                    <span>&rsaquo;</span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><Link to="/shop" className="hover:text-champagne-300 transition">&rsaquo; Necklace Sets</Link></li>
                  <li><Link to="/shop" className="hover:text-champagne-300 transition">&rsaquo; Bridal Jewellery</Link></li>
                  <li><Link to="/shop" className="hover:text-champagne-300 transition">&rsaquo; Earrings & Jhumkas</Link></li>
                  <li><Link to="/shop" className="hover:text-champagne-300 transition">&rsaquo; Bangles & Kadas</Link></li>
                  <li><Link to="/shop" className="hover:text-champagne-300 transition">&rsaquo; Finger Rings</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider text-champagne-400 uppercase mb-4">
              Customer Information
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-300">
              <li>
                <Link to="/policies#shipping" className="hover:text-champagne-300 transition">
                  Shipping & Delivery Information
                </Link>
              </li>
              <li>
                <Link to="/policies#returns" className="hover:text-champagne-300 transition">
                  Return & Exchange Policy
                </Link>
              </li>
              <li>
                <Link to="/policies#terms" className="hover:text-champagne-300 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/policies#privacy" className="hover:text-champagne-300 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-champagne-300 transition">
                  Jewellery Care Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider text-champagne-400 uppercase mb-4">
              Contact & Inquiries
            </h4>
            <div className="space-y-3 text-xs text-cream-300">
              <div className="flex items-start space-x-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-champagne-400 shrink-0 mt-0.5" />
                <span className="truncate">{settings.contact_email}</span>
              </div>
              {settings.address && (
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-champagne-400 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.instagram_url && (
                <div className="pt-1">
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-champagne-300 hover:text-white transition"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow on Instagram</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-brown-900 text-center text-xs text-cream-400 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <p>
            &copy; {new Date().getFullYear()} {settings.shop_name || 'VIVI Creations'}. All rights reserved.
          </p>
          <p className="flex items-center justify-center space-x-1 text-[11px] text-cream-400">
            <span>Handcrafted Indian Imitation Jewellery</span>
            <span>&bull;</span>
            <Link to="/admin/login" className="hover:text-champagne-300 transition">Owner Portal</Link>
          </p>
        </div>

      </div>
    </footer>
  );
};
