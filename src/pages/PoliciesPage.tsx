import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Truck, RotateCcw, FileText, Shield, Sparkles } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { settings } = useShop();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-cream-50 py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Customer Protection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-950">
            Policies & Information
          </h1>
          <p className="text-xs sm:text-sm text-brown-600 mt-2">
            Clear, transparent policies for our handcrafted imitation jewellery collections.
          </p>
        </div>

        <div className="space-y-10">
          
          {/* Shipping Policy */}
          <div id="shipping" className="bg-white rounded-3xl p-8 border border-champagne-200/90 shadow-soft scroll-mt-24">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-brown-950">
                Shipping & Delivery Information
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-brown-700 space-y-3 leading-relaxed">
              <p>
                {settings.shipping_info}
              </p>
              <ul className="list-disc list-inside space-y-1.5 pt-2 text-brown-600">
                <li>Orders are verified and packaged with robust bubble wrap to prevent stone damage during transit.</li>
                <li>Tracking details are sent directly to your WhatsApp once dispatched via premier Indian courier services.</li>
                <li>Standard delivery timelines range between 3 to 6 working days depending on your pin code.</li>
              </ul>
            </div>
          </div>

          {/* Return & Exchange Policy */}
          <div id="returns" className="bg-white rounded-3xl p-8 border border-champagne-200/90 shadow-soft scroll-mt-24">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-brown-950">
                Return & Replacement Policy
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-brown-700 space-y-3 leading-relaxed">
              <p>
                {settings.return_policy}
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Mandatory Requirement:</strong> To prevent fraudulent claims, a complete 360-degree continuous parcel unboxing video (showing the sealed shipping label before opening) is strictly required for any damage claims.
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div id="terms" className="bg-white rounded-3xl p-8 border border-champagne-200/90 shadow-soft scroll-mt-24">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-brown-950">
                Terms & Conditions
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-brown-700 space-y-3 leading-relaxed">
              <p>
                {settings.terms_and_conditions}
              </p>
              <ul className="list-disc list-inside space-y-1.5 pt-2 text-brown-600">
                <li>All products sold are premium Indian fashion & imitation jewellery (not real gold, silver, or diamonds).</li>
                <li>Slight color tone variations may occur due to photographic lighting and smartphone screen calibrations.</li>
                <li>Prices listed on this website are final shop catalogue rates in Indian Rupees (₹). Courier charges may apply based on delivery location.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
