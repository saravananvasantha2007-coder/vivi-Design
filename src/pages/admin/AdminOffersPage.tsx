import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { Offer } from '../../types';
import {
  Tag,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminOffersPage: React.FC = () => {
  const { offers, fetchOffers } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openNewModal = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setStartAt('');
    setEndAt('');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDiscountType(offer.discount_type || 'percentage');
    setDiscountValue(offer.discount_value ? offer.discount_value.toString() : '');
    setStartAt(offer.start_at ? offer.start_at.slice(0, 10) : '');
    setEndAt(offer.end_at ? offer.end_at.slice(0, 10) : '');
    setIsActive(offer.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Offer title is required.');
      return;
    }

    const numDiscount = discountValue ? parseFloat(discountValue) : null;
    if (numDiscount !== null && (isNaN(numDiscount) || numDiscount < 0)) {
      setErrorMsg('Discount value must be a valid non-negative number.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        discount_type: discountType,
        discount_value: numDiscount,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        is_active: isActive,
      };

      if (editingOffer) {
        const { error } = await supabase.from('offers').update(payload).eq('id', editingOffer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offers').insert(payload);
        if (error) throw error;
      }

      await fetchOffers();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save offer.');
    } finally {
      setSaving(false);
    }
  };

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);

      if (error) {
        alert('Could not update offer status: ' + error.message);
      } else {
        fetchOffers();
      }
    } catch (err: any) {
      alert('Error updating offer: ' + err.message);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) {
        alert('Could not delete offer: ' + error.message);
      } else {
        fetchOffers();
      }
    } catch (err: any) {
      alert('Error deleting offer: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
            Promotions & Special Offers ({offers.length})
          </h1>
          <p className="text-xs text-brown-500 mt-1">
            Create limited-time festive deals, bridal combo promotions, or coupon discounts.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-champagne-300">
            <Tag className="w-12 h-12 text-champagne-600 mx-auto mb-2 opacity-80" />
            <h3 className="font-serif text-lg font-bold text-brown-950">No promotional offers created yet</h3>
            <p className="text-xs text-brown-500 max-w-sm mx-auto mt-1 mb-4">
              Add festive discounts like "Diwali 10% Off on Choker Sets" or "Free Matching Jhumka on Bridal Orders".
            </p>
            <button
              onClick={openNewModal}
              className="inline-flex items-center space-x-1.5 bg-champagne-600 hover:bg-champagne-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Offer</span>
            </button>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-soft flex flex-col justify-between ${
                offer.is_active ? 'border-champagne-300' : 'border-gray-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      offer.is_active
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {offer.discount_type === 'percentage'
                      ? `${offer.discount_value}% OFF`
                      : offer.discount_value
                      ? `Flat ₹${offer.discount_value} OFF`
                      : 'Special Deal'}
                  </span>

                  <button
                    onClick={() => toggleOfferStatus(offer)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                      offer.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <h3 className="font-serif text-lg font-bold text-brown-950 mb-1">
                  {offer.title}
                </h3>

                <p className="text-xs text-brown-600 leading-relaxed mb-4 line-clamp-3">
                  {offer.description}
                </p>

                {offer.end_at && (
                  <p className="text-[11px] text-brown-400 flex items-center space-x-1 mb-2">
                    <Clock className="w-3.5 h-3.5 text-champagne-600" />
                    <span>Expires: {new Date(offer.end_at).toLocaleDateString()}</span>
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-champagne-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(offer)}
                  className="p-1.5 text-champagne-700 hover:text-champagne-900 rounded-lg hover:bg-champagne-50 transition"
                  title="Edit Offer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition"
                  title="Delete Offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-champagne-300 relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-brown-400 hover:text-brown-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-brown-950 text-lg">
                  {editingOffer ? 'Edit Special Offer' : 'Configure New Offer'}
                </h3>
                <p className="text-xs text-brown-500">Live promotion for customer website</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Wedding Discount - 15% OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Offer Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Get 15% instant discount when you order any bridal or temple necklace set on WhatsApp..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-champagne-300 text-xs text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-white"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Rupee Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={discountType === 'percentage' ? '15' : '300'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-champagne-300 text-xs text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-champagne-300 text-xs text-brown-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-champagne-300 text-xs text-brown-950"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-brown-900">Make offer active and visible immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brown-600 hover:bg-brown-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-champagne-600 hover:bg-champagne-700 text-white shadow transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
