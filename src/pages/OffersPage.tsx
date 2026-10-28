import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { createGeneralWhatsAppUrl } from '../lib/whatsapp';
import { Tag, Clock, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const { offers, settings } = useShop();

  const now = new Date();
  const validOffers = offers.filter((offer) => {
    if (!offer.is_active) return false;
    if (offer.end_at && new Date(offer.end_at) < now) return false;
    return true;
  });

  const whatsappUrl = createGeneralWhatsAppUrl(settings, "Hello VIVI Creations! I am interested in checking your current offers and festive deals.");

  return (
    <div className="min-h-screen bg-cream-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Exclusive Promotions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-950">
            Special Jewellery Offers
          </h1>
          <p className="text-xs sm:text-sm text-brown-600 mt-2">
            Verified festive discounts, bridal combos, and special deals configured by VIVI Creations.
          </p>
        </div>

        {validOffers.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-champagne-200 shadow-soft max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-champagne-100 text-champagne-700 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brown-950 mb-2">
              No Active Offers At This Moment
            </h3>
            <p className="text-xs text-brown-600 mb-6 leading-relaxed">
              We frequently announce festive promotions, festival coupon deals, and combo offers. In the meantime, explore our regular collection or chat directly on WhatsApp!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-champagne-600 hover:bg-champagne-700 text-white text-xs font-semibold shadow transition"
              >
                Browse Jewellery Catalogue
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#25D366] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {validOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-6 border-2 border-champagne-300 shadow-soft hover:shadow-gold transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-gradient-to-r from-amber-600 to-champagne-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}% OFF`
                        : offer.discount_value
                        ? `Save ₹${offer.discount_value}`
                        : 'Special Offer'}
                    </span>

                    {offer.end_at && (
                      <span className="text-[11px] text-brown-500 flex items-center space-x-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-champagne-600" />
                        <span>Valid till {new Date(offer.end_at).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-brown-950 mb-3">
                    {offer.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-brown-600 leading-relaxed mb-6">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-champagne-100 flex items-center justify-between">
                  <a
                    href={createGeneralWhatsAppUrl(
                      settings,
                      `Hello VIVI Creations! I would like to claim the offer: "${offer.title}". Please guide me.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-full text-xs font-bold shadow transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Claim via WhatsApp</span>
                  </a>

                  <Link
                    to="/shop"
                    className="text-xs font-bold text-champagne-800 hover:text-champagne-950 flex items-center space-x-1"
                  >
                    <span>Shop Items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
