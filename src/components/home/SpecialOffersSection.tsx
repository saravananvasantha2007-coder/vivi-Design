import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Tag, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const SpecialOffersSection: React.FC = () => {
  const { offers } = useShop();

  // Filter only active offers whose end_at is null or in the future
  const now = new Date();
  const validOffers = offers.filter((offer) => {
    if (!offer.is_active) return false;
    if (offer.end_at && new Date(offer.end_at) < now) return false;
    return true;
  });

  if (validOffers.length === 0) {
    return null; // As per requirement: "Do not display fake reviews, fake customer numbers, or unverified offers."
  }

  return (
    <section className="py-12 bg-gradient-to-r from-amber-900 via-brown-900 to-amber-950 text-white border-y border-champagne-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-champagne-400/20">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-champagne-400/20 text-champagne-300 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-champagne-200">
                Special Festive Offers
              </h2>
              <p className="text-xs text-cream-300">
                Exclusive limited-time promotions directly from VIVI Creations
              </p>
            </div>
          </div>

          <Link
            to="/offers"
            className="text-xs font-semibold text-champagne-300 hover:text-white flex items-center space-x-1"
          >
            <span>View All Offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-brown-900/80 border border-champagne-400/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-champagne-500/10 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-champagne-400 text-brown-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {offer.discount_type === 'percentage'
                      ? `${offer.discount_value}% Discount`
                      : offer.discount_value
                      ? `Save ₹${offer.discount_value}`
                      : 'Special Deal'}
                  </span>

                  {offer.end_at && (
                    <span className="text-[11px] text-champagne-200 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-champagne-400" />
                      <span>Ends {new Date(offer.end_at).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl font-bold text-white mb-2">
                  {offer.title}
                </h3>

                <p className="text-xs text-cream-200 leading-relaxed mb-4">
                  {offer.description}
                </p>
              </div>

              <div className="pt-4 border-t border-champagne-500/20 flex items-center justify-between">
                <span className="text-[11px] text-cream-300 italic">
                  Mention this offer when placing WhatsApp order
                </span>

                <Link
                  to="/shop"
                  className="bg-champagne-500 hover:bg-champagne-600 text-brown-950 font-bold px-4 py-1.5 rounded-full text-xs transition"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
