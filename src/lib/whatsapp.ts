import { Product, ShopSettings } from '../types';
import { cleanWhatsAppNumber, formatINR } from './supabase';

export function createWhatsAppOrderUrl(product: Product, settings: ShopSettings): string {
  const phone = cleanWhatsAppNumber(settings.whatsapp_number || '919876543210');
  
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vivicreations.com';
  const productUrl = `${siteUrl}/product/${product.slug || product.id}`;
  
  const formattedPrice = formatINR(product.price);
  
  const message = [
    `Hello ${settings.shop_name || 'VIVI Creations'}! ✨`,
    `I am interested in purchasing the *${product.name}* priced at *${formattedPrice}*.`,
    `Ref ID: ${product.slug || product.id}`,
    `Product Link: ${productUrl}`,
    `\nIs this item available for delivery? Please share the ordering and payment details. Thank you!`
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function createGeneralWhatsAppUrl(settings: ShopSettings, customGreeting?: string): string {
  const phone = cleanWhatsAppNumber(settings.whatsapp_number || '919876543210');
  const greeting = customGreeting || `Hello ${settings.shop_name || 'VIVI Creations'}! I would like to inquire about your jewellery collection.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
}
