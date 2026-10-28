import React from 'react';
import { useShop } from '../context/ShopContext';
import { createGeneralWhatsAppUrl } from '../lib/whatsapp';
import { MessageCircle, Mail, MapPin, Instagram, Clock, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useShop();
  const whatsappUrl = createGeneralWhatsAppUrl(settings, "Hello VIVI Creations! I would like to inquire about your jewellery products.");

  return (
    <div className="min-h-screen bg-cream-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Assistance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-950">
            Contact VIVI Creations
          </h1>
          <p className="text-xs sm:text-sm text-brown-600 mt-2">
            Have questions about a jewellery design, custom bridal matching, or dispatch time? Reach out directly!
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Main Direct WhatsApp Ordering Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-champagne-200/90 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brown-950">Direct WhatsApp Support</h2>
                  <p className="text-xs text-brown-500">Fastest response for pricing, availability, and orders</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-brown-700 leading-relaxed mb-6">
                At VIVI Creations, we offer high-touch personal customer service. When you order through WhatsApp, you communicate directly with the owner to:
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-brown-700 mb-8">
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-champagne-100 text-champagne-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span>Confirm current inventory and check if a piece is ready for immediate dispatch.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-champagne-100 text-champagne-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span>Share photos of your saree or bridal outfit to verify matching color tones and necklace length.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-champagne-100 text-champagne-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span>Receive your tracking code as soon as the courier parcel is dispatched.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-champagne-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-md transition"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Start WhatsApp Conversation (+{settings.whatsapp_number})</span>
              </a>
            </div>
          </div>

          {/* Business Information Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-champagne-200/90 shadow-soft space-y-4">
              <h3 className="font-serif text-lg font-bold text-brown-950 pb-2 border-b border-champagne-100">
                Shop Details
              </h3>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-brown-700">
                <Mail className="w-4 h-4 text-champagne-700 shrink-0 mt-1" />
                <div>
                  <span className="block text-[11px] text-brown-400 font-semibold uppercase">Email</span>
                  <a href={`mailto:${settings.contact_email}`} className="text-brown-900 font-medium hover:underline">
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              {settings.address && (
                <div className="flex items-start space-x-3 text-xs sm:text-sm text-brown-700">
                  <MapPin className="w-4 h-4 text-champagne-700 shrink-0 mt-1" />
                  <div>
                    <span className="block text-[11px] text-brown-400 font-semibold uppercase">Location</span>
                    <span className="text-brown-900 font-medium">{settings.address}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-brown-700">
                <Clock className="w-4 h-4 text-champagne-700 shrink-0 mt-1" />
                <div>
                  <span className="block text-[11px] text-brown-400 font-semibold uppercase">Business Hours</span>
                  <span className="text-brown-900 font-medium">Monday to Saturday: 10:00 AM – 8:00 PM IST</span>
                </div>
              </div>

              {settings.instagram_url && (
                <div className="pt-2">
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-champagne-800 hover:text-champagne-950 bg-champagne-50 hover:bg-champagne-100 px-4 py-2 rounded-xl transition border border-champagne-200"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow {settings.shop_name} on Instagram</span>
                  </a>
                </div>
              )}
            </div>

            {/* Imitation Jewellery Care Instructions */}
            <div className="bg-amber-900/90 text-white rounded-3xl p-6 border border-champagne-400/30 shadow-soft space-y-3">
              <h4 className="font-serif text-base font-bold text-champagne-200 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Jewellery Care Guide</span>
              </h4>
              <p className="text-xs text-cream-200 leading-relaxed">
                To keep your imitation jewellery looking sparkling and gold-finished for years:
              </p>
              <ul className="text-xs text-cream-200 space-y-1.5 list-disc list-inside">
                <li>Keep away from perfumes, hairsprays, and moisture.</li>
                <li>Wear your jewellery after applying all makeup and lotion.</li>
                <li>Wipe gently with a soft dry cloth after wearing.</li>
                <li>Store in an airtight ziplock pouch away from sunlight.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
