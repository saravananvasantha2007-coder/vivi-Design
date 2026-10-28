import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase, cleanWhatsAppNumber } from '../../lib/supabase';
import {
  Settings,
  MessageCircle,
  Mail,
  Instagram,
  MapPin,
  Truck,
  RotateCcw,
  FileText,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, fetchSettings, updateSettingsState } = useShop();

  const [shopName, setShopName] = useState(settings.shop_name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [contactEmail, setContactEmail] = useState(settings.contact_email);
  const [businessDescription, setBusinessDescription] = useState(settings.business_description);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url || '');
  const [address, setAddress] = useState(settings.address || '');
  const [shippingInfo, setShippingInfo] = useState(settings.shipping_info);
  const [returnPolicy, setReturnPolicy] = useState(settings.return_policy);
  const [termsAndConditions, setTermsAndConditions] = useState(settings.terms_and_conditions);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setShopName(settings.shop_name);
    setTagline(settings.tagline);
    setWhatsappNumber(settings.whatsapp_number);
    setContactEmail(settings.contact_email);
    setBusinessDescription(settings.business_description);
    setInstagramUrl(settings.instagram_url || '');
    setAddress(settings.address || '');
    setShippingInfo(settings.shipping_info);
    setReturnPolicy(settings.return_policy);
    setTermsAndConditions(settings.terms_and_conditions);
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedSuccess(false);

    if (!whatsappNumber.trim()) {
      setErrorMsg('WhatsApp number is required for customer ordering.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: 'default',
        shop_name: shopName.trim(),
        tagline: tagline.trim(),
        whatsapp_number: whatsappNumber.trim(),
        contact_email: contactEmail.trim(),
        business_description: businessDescription.trim(),
        instagram_url: instagramUrl.trim() || null,
        address: address.trim() || null,
        shipping_info: shippingInfo.trim(),
        return_policy: returnPolicy.trim(),
        terms_and_conditions: termsAndConditions.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('shop_settings').upsert(payload);

      if (error) throw error;

      updateSettingsState(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      await fetchSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppUrl = `https://wa.me/${cleanWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(
    `Hello ${shopName}! This is a test message to confirm your WhatsApp ordering link works properly.`
  )}`;

  return (
    <div className="max-w-4xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
          Shop & WhatsApp Configuration
        </h1>
        <p className="text-xs text-brown-500 mt-1">
          Configure your WhatsApp ordering number, brand details, shipping timeline, and store policies.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Business settings updated successfully and synced live!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* WHATSAPP ORDERING CONFIGURATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-300 shadow-soft">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-champagne-100">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-brown-950">WhatsApp Ordering Contact</h2>
              <p className="text-xs text-brown-500">The phone number where all customer order inquiries are received</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1.5">
                Shop WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  required
                  placeholder="919876543210 (Include country code, e.g. 91 for India)"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 font-mono focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />

                <a
                  href={testWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow"
                  title="Send test message to check number"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-brown-400 mt-1.5">
                Format: 10-digit Indian mobile number or with country code (e.g. <code>919876543210</code> or <code>9876543210</code>).
              </p>
            </div>
          </div>
        </div>

        {/* BRAND & CONTACT INFORMATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200/90 shadow-soft">
          <h2 className="font-serif text-lg font-bold text-brown-950 mb-6 pb-4 border-b border-champagne-100">
            Brand Profile & Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Shop Name
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Instagram Page URL
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/vivicreations"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Shop Address / Location
              </label>
              <input
                type="text"
                placeholder="e.g. T. Nagar, Chennai, Tamil Nadu, India"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Business Description
              </label>
              <textarea
                rows={3}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* POLICIES & CUSTOMER INFORMATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200/90 shadow-soft">
          <h2 className="font-serif text-lg font-bold text-brown-950 mb-6 pb-4 border-b border-champagne-100">
            Shipping & Return Policies
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Shipping Information
              </label>
              <textarea
                rows={2}
                value={shippingInfo}
                onChange={(e) => setShippingInfo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Return & Replacement Policy
              </label>
              <textarea
                rows={2}
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
