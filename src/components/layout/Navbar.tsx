import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { createGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { MessageCircle, Menu, X, Sparkles, Shield, ShoppingBag, Radio } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings, realtimeConnected } = useShop();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const generalWhatsAppUrl = createGeneralWhatsAppUrl(settings);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'New Arrivals', path: '/shop?filter=new' },
    { name: 'Collections', path: '/collections' },
    { name: 'Offers', path: '/offers' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-champagne-200 transition-all shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-brown-900 text-champagne-100 py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-champagne-400 animate-pulse" />
            <span className="truncate">Handcrafted Indian Imitation Jewellery &bull; Direct WhatsApp Order</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Realtime Live Sync Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-cream-300">
              <span className={`inline-block w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{realtimeConnected ? 'Live Catalogue' : 'Syncing'}</span>
            </div>

            {/* Admin Dashboard shortcut if logged in */}
            {user && isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-1 text-champagne-300 hover:text-white transition font-medium"
              >
                <Shield className="w-3 h-3" />
                <span>Owner Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="text-cream-400 hover:text-champagne-300 transition text-[11px]"
              >
                Owner Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-champagne-300 via-champagne-500 to-champagne-700 flex items-center justify-center p-0.5 shadow-gold group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-brown-900 flex items-center justify-center text-champagne-300">
                <Sparkles className="w-5 h-5 text-champagne-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-wider text-brown-950 group-hover:text-champagne-700 transition">
                {settings.shop_name || 'VIVI Creations'}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-champagne-700 -mt-1 font-sans">
                {settings.tagline || 'Elegance That Makes You Shine'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'bg-champagne-200/80 text-brown-950 font-bold shadow-sm'
                      : 'text-brown-700 hover:text-brown-950 hover:bg-champagne-100/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: WhatsApp Direct Contact & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Chat on WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-brown-800 hover:bg-champagne-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-50 border-b border-champagne-200 px-4 pt-2 pb-6 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-champagne-200 text-brown-900 font-bold'
                    : 'text-brown-700 hover:bg-champagne-100/80'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-champagne-200 flex flex-col space-y-2">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-semibold"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Message Shop Owner</span>
            </a>

            {user && isAdmin ? (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-brown-900 text-champagne-200 py-2.5 rounded-xl text-sm font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Owner Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs text-brown-500 py-1.5"
              >
                Owner Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
