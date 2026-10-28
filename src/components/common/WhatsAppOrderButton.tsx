import React, { useState } from 'react';
import { Product, ShopSettings } from '../../types';
import { createWhatsAppOrderUrl } from '../../lib/whatsapp';
import { formatINR, cleanWhatsAppNumber } from '../../lib/supabase';
import { MessageCircle, Check, Copy, ExternalLink, X } from 'lucide-react';

interface WhatsAppOrderButtonProps {
  product: Product;
  settings: ShopSettings;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
  label?: string;
}

export const WhatsAppOrderButton: React.FC<WhatsAppOrderButtonProps> = ({
  product,
  settings,
  className = '',
  variant = 'primary',
  label = 'Order on WhatsApp',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderUrl = createWhatsAppOrderUrl(product, settings);
  const formattedPrice = formatINR(product.price);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const productUrl = `${siteUrl}/product/${product.slug || product.id}`;
  
  const textMessage = `Hello ${settings.shop_name || 'VIVI Creations'}! ✨\nI am interested in purchasing the *${product.name}* priced at *${formattedPrice}*.\nRef ID: ${product.slug || product.id}\nProduct Link: ${productUrl}\n\nIs this item available for delivery? Please share the ordering and payment details. Thank you!`;

  const handleClick = (e: React.MouseEvent) => {
    // If product is out of stock, warn or still allow inquiry
    if (!product.available) {
      // User can still ask owner about restocking
    }
    
    // Open in new tab or window
    const win = window.open(orderUrl, '_blank', 'noopener,noreferrer');
    
    // If popup was blocked or desktop browser needs easy copy option, show modal fallback
    if (!win || win.closed || typeof win.closed === 'undefined') {
      setShowModal(true);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed');
    }
  };

  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 shadow-sm active:scale-95";
  
  let variantStyle = "bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[#25D366]/20 shadow-lg px-5 py-2.5 text-sm";
  if (variant === 'secondary') {
    variantStyle = "bg-champagne-100 hover:bg-champagne-200 text-brown-900 border border-champagne-300 px-4 py-2 text-xs";
  } else if (variant === 'compact') {
    variantStyle = "bg-[#25D366] hover:bg-[#20ba59] text-white p-2 rounded-full";
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`${baseStyle} ${variantStyle} ${className}`}
        title={`Order ${product.name} on WhatsApp`}
      >
        <MessageCircle className={`w-4 h-4 ${variant === 'compact' ? '' : 'mr-2'} fill-current`} />
        {variant !== 'compact' && <span>{label}</span>}
      </button>

      {/* Fallback & Desktop Helper Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-champagne-300 relative text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-brown-400 hover:text-brown-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-brown-900 text-base">Direct WhatsApp Ordering</h3>
                <p className="text-xs text-brown-500">Shop WhatsApp: +{cleanWhatsAppNumber(settings.whatsapp_number)}</p>
              </div>
            </div>

            <p className="text-xs text-brown-600 mb-3">
              If WhatsApp did not open automatically, click the button below to continue to WhatsApp Web or copy the inquiry details to message us directly.
            </p>

            <div className="bg-cream-100 border border-champagne-200 rounded-xl p-3 text-xs text-brown-800 font-mono whitespace-pre-line mb-4 max-h-36 overflow-y-auto">
              {textMessage}
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopyText}
                className="bg-cream-200 hover:bg-cream-300 text-brown-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-champagne-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-brown-400 mt-4 text-center">
              * Note: Opening WhatsApp does not complete or charge an order. The shop owner will verify current stock, delivery pin code, and payment options with you directly.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
