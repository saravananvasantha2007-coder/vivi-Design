import React from 'react';
import { Link } from 'react-router-dom';
import { Product, ShopSettings } from '../../types';
import { formatINR, getJewelleryImageUrl } from '../../lib/supabase';
import { WhatsAppOrderButton } from '../common/WhatsAppOrderButton';
import { Sparkles, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  settings: ShopSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, settings }) => {
  const imageUrl = getJewelleryImageUrl(product.image_url);
  
  // Calculate discount percentage if original_price is greater than current price
  let discountPercentage = 0;
  if (product.original_price && product.original_price > product.price) {
    discountPercentage = Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-champagne-200/80 shadow-soft hover:shadow-gold transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-cream-100 overflow-hidden">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival && (
            <span className="bg-gradient-to-r from-amber-600 to-champagne-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-champagne-200" />
              <span>New</span>
            </span>
          )}

          {product.is_best_seller && (
            <span className="bg-brown-900 text-champagne-300 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md border border-champagne-400/30">
              Best Seller
            </span>
          )}

          {discountPercentage > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full shadow">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Availability Badge Overlay */}
        <div className="absolute bottom-3 left-3 z-10">
          {product.available ? (
            <span className="inline-flex items-center space-x-1 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>In Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 bg-brown-900/90 backdrop-blur-sm text-rose-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-rose-500/30 shadow-sm">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Sold Out</span>
            </span>
          )}
        </div>

        {/* Quick View Overlay on hover for desktop */}
        <div className="hidden sm:flex absolute inset-0 bg-brown-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center pointer-events-none">
          <Link
            to={`/product/${product.slug || product.id}`}
            className="pointer-events-auto bg-white/95 text-brown-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-champagne-100 transition flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye className="w-3.5 h-3.5 text-champagne-700" />
            <span>View Details</span>
          </Link>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category Tag */}
          {product.category?.name && (
            <span className="text-[11px] font-medium tracking-wide uppercase text-champagne-700 mb-1 block">
              {product.category.name}
            </span>
          )}

          {/* Product Title */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="block font-serif text-base font-semibold text-brown-950 group-hover:text-champagne-700 transition line-clamp-1"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Price Section */}
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-lg font-bold text-brown-950 font-serif">
              {formatINR(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-brown-400 line-through">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-champagne-100 flex items-center space-x-2">
          {/* View Details link for mobile */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="sm:hidden flex-1 text-center py-2 px-3 rounded-full text-xs font-semibold bg-champagne-50 hover:bg-champagne-100 text-brown-800 border border-champagne-200 transition"
          >
            Details
          </Link>

          {/* WhatsApp Order Button */}
          <WhatsAppOrderButton
            product={product}
            settings={settings}
            className="flex-1 py-2 text-xs font-semibold"
            label={product.available ? "Order on WhatsApp" : "Inquire Stock"}
          />
        </div>
      </div>
    </div>
  );
};
