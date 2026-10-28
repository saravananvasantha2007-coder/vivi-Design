import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { supabase, generateSlug, getJewelleryImageUrl } from '../../lib/supabase';
import { Product } from '../../types';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Camera,
} from 'lucide-react';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { categories, products, fetchCategories, fetchProducts } = useShop();

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [stockQuantity, setStockQuantity] = useState<string>('1');
  const [available, setAvailable] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Main Image
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Additional Gallery Images
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // New Category inline creation
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Form state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load product if editing
  useEffect(() => {
    if (!isEditing || !id) return;

    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(*)
          `)
          .eq('id', id)
          .single();

        if (!error && data && mounted) {
          setName(data.name || '');
          setSlug(data.slug || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setOriginalPrice(data.original_price?.toString() || '');
          setCategoryId(data.category_id || '');
          setStockQuantity(data.stock_quantity?.toString() || '1');
          setAvailable(data.available ?? true);
          setIsNewArrival(data.is_new_arrival ?? false);
          setIsBestSeller(data.is_best_seller ?? false);
          setIsPublished(data.is_published ?? true);
          setMainImageUrl(data.image_url || '');

          if (data.images && data.images.length > 0) {
            setExistingImages(data.images.map((img: any) => img.image_path));
          }
        } else if (error) {
          setErrorMsg('Failed to load product: ' + error.message);
        }
      } catch (err: any) {
        setErrorMsg('Error: ' + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  // Auto-generate slug when name changes (only in add mode or if slug is empty)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(generateSlug(val));
    }
  };

  // Main Image selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setErrorMsg(null);
    setMainImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setMainImagePreview(objectUrl);
  };

  // Additional images selection
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) continue;
      validFiles.push(f);
      previews.push(URL.createObjectURL(f));
    }

    setAdditionalFiles((prev) => [...prev, ...validFiles]);
    setAdditionalPreviews((prev) => [...prev, ...previews]);
  };

  const removeAdditionalPreview = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (path: string) => {
    setExistingImages((prev) => prev.filter((p) => p !== path));
    if (id) {
      await supabase.from('product_images').delete().eq('product_id', id).eq('image_path', path);
    }
  };

  // Inline category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const catSlug = generateSlug(newCategoryName);
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: newCategoryName.trim(),
        slug: catSlug,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg('Could not create category: ' + error.message);
    } else if (data) {
      await fetchCategories();
      setCategoryId(data.id);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Save Product Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Please enter a valid selling price in Indian Rupees (₹).');
      return;
    }

    let numOriginalPrice: number | null = null;
    if (originalPrice.trim() !== '') {
      numOriginalPrice = parseFloat(originalPrice);
      if (isNaN(numOriginalPrice) || numOriginalPrice < 0) {
        setErrorMsg('Original price must be a valid positive number.');
        return;
      }
    }

    if (!mainImageFile && !mainImageUrl.trim()) {
      setErrorMsg('Please upload a product photograph or enter an image URL.');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = mainImageUrl;

      // 1. Upload main image to Supabase Storage if file was selected
      if (mainImageFile) {
        setUploadProgress('Uploading primary jewellery photo...');
        const fileExt = mainImageFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('jewellery-images')
          .upload(filePath, mainImageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          throw new Error('Image upload failed: ' + uploadErr.message);
        }

        finalImageUrl = filePath;
      }

      // Generate or preserve unique slug
      const finalSlug = slug.trim() || generateSlug(name) + '-' + Date.now().toString().slice(-4);

      const productPayload = {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        price: numPrice,
        original_price: numOriginalPrice,
        category_id: categoryId || null,
        image_url: finalImageUrl,
        stock_quantity: parseInt(stockQuantity, 10) || 1,
        available,
        is_new_arrival: isNewArrival,
        is_best_seller: isBestSeller,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      };

      let productId = id;

      if (isEditing && id) {
        setUploadProgress('Updating jewellery details...');
        const { error: updateErr } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id);

        if (updateErr) throw updateErr;
      } else {
        setUploadProgress('Publishing new jewellery to database...');
        const { data: newProd, error: insertErr } = await supabase
          .from('products')
          .insert(productPayload)
          .select()
          .single();

        if (insertErr) throw insertErr;
        productId = newProd.id;
      }

      // 2. Upload any additional gallery photos
      if (additionalFiles.length > 0 && productId) {
        setUploadProgress(`Uploading ${additionalFiles.length} additional gallery photo(s)...`);

        for (let i = 0; i < additionalFiles.length; i++) {
          const file = additionalFiles[i];
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-extra-${i}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: extraUploadErr } = await supabase.storage
            .from('jewellery-images')
            .upload(filePath, file, { cacheControl: '3600' });

          if (!extraUploadErr) {
            await supabase.from('product_images').insert({
              product_id: productId,
              image_path: filePath,
              display_order: i + 1,
            });
          }
        }
      }

      await fetchProducts();
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setErrorMsg(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-champagne-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-brown-700">Loading jewellery record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans pb-12">
      
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brown-600 hover:text-brown-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-champagne-200/90 shadow-soft">
        
        <div className="mb-8 pb-4 border-b border-champagne-100">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
            {isEditing ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
          </h1>
          <p className="text-xs text-brown-500 mt-1">
            Fill in the details below. Once published, this piece will instantly be visible to all customers browsing your website.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: PHOTO UPLOAD */}
          <div>
            <h3 className="font-serif text-base font-bold text-brown-950 mb-3 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-champagne-700" />
              <span>Jewellery Photographs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Primary Image Upload & Preview */}
              <div className="md:col-span-6 space-y-3">
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider">
                  Primary Photograph <span className="text-red-500">*</span>
                </label>

                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-champagne-300 bg-cream-50/70 overflow-hidden flex flex-col items-center justify-center p-4 group hover:border-champagne-500 transition">
                  {mainImagePreview || mainImageUrl ? (
                    <>
                      <img
                        src={mainImagePreview || getJewelleryImageUrl(mainImageUrl)}
                        alt="Product preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <label className="absolute inset-0 bg-brown-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-semibold">
                        <Upload className="w-6 h-6 mb-1" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-champagne-100 text-champagne-700 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-brown-900">Upload Jewellery Photo</span>
                      <span className="text-[10px] text-brown-500 mt-1">
                        Select from phone gallery or drag & drop (JPEG, PNG, WEBP max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Direct Image URL input fallback */}
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-brown-600 mb-1">
                    Or Paste Image URL directly:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/jewellery-photo.jpg"
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-champagne-200 text-xs text-brown-900 bg-cream-50/40 focus:outline-none focus:ring-1 focus:ring-champagne-500"
                  />
                </div>
              </div>

              {/* Additional Photos for Multi-image Carousel */}
              <div className="md:col-span-6 space-y-3">
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider">
                  Additional Photos (Gallery / Angle Views)
                </label>

                <div className="border border-champagne-200 rounded-2xl p-4 bg-cream-50/40 min-h-[180px] flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* Existing saved images */}
                    {existingImages.map((path, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-champagne-200 group">
                        <img
                          src={getJewelleryImageUrl(path)}
                          alt="Gallery view"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(path)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Newly selected preview images */}
                    {additionalPreviews.map((previewUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-champagne-200 group">
                        <img
                          src={previewUrl}
                          alt="New gallery view"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalPreview(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl border border-dashed border-champagne-300 text-xs font-semibold text-brown-800 hover:bg-champagne-50 cursor-pointer transition">
                    <Plus className="w-4 h-4 text-champagne-700" />
                    <span>Add More Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAdditionalImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: PRODUCT BASIC INFO */}
          <div className="pt-6 border-t border-champagne-100 space-y-4">
            <h3 className="font-serif text-base font-bold text-brown-950">
              Basic Details & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Peacock Kundan Choker Necklace Set"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              {/* Selling Price (₹) */}
              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Selling Price in Rupees (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-brown-500 font-serif">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 font-bold focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              {/* Original Price (₹) for discount */}
              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Original Price (₹) <span className="text-brown-400 font-normal lowercase">(optional for strikethrough)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-brown-500 font-serif">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="2199"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="text-[11px] font-semibold text-champagne-700 hover:underline"
                  >
                    + Create New Category
                  </button>
                </div>

                {showAddCategory ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Temple Jewellery"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-champagne-300 text-xs text-brown-900 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-2 rounded-xl bg-champagne-600 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(false)}
                      className="px-2 py-2 text-xs text-brown-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-white"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              {/* URL Slug */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  URL Slug <span className="text-brown-400 font-normal lowercase">(auto-generated, unique web identifier)</span>
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-brown-400 bg-cream-100 px-3 py-2.5 rounded-l-xl border border-r-0 border-champagne-300 font-mono">
                    /product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-r-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 font-mono focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-brown-800 uppercase tracking-wider mb-1">
                  Description & Craft Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe stone type (kundan, pearl, ruby), plating quality, necklace closure (dori/hook), earring length, and occasion wear..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 text-xs sm:text-sm text-brown-950 focus:outline-none focus:ring-2 focus:ring-champagne-500 leading-relaxed"
                />
              </div>

            </div>
          </div>

          {/* SECTION 3: BADGES & PUBLISH CONTROLS */}
          <div className="pt-6 border-t border-champagne-100 space-y-4">
            <h3 className="font-serif text-base font-bold text-brown-950">
              Display & Inventory Toggles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* In Stock */}
              <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-champagne-200 bg-cream-50/50 cursor-pointer hover:bg-champagne-50 transition">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-brown-900">In Stock</span>
                  <span className="text-[10px] text-brown-500">Available to purchase</span>
                </div>
              </label>

              {/* New Arrival */}
              <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-champagne-200 bg-cream-50/50 cursor-pointer hover:bg-champagne-50 transition">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-brown-900">New Arrival</span>
                  <span className="text-[10px] text-brown-500">Show in fresh arrivals</span>
                </div>
              </label>

              {/* Best Seller */}
              <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-champagne-200 bg-cream-50/50 cursor-pointer hover:bg-champagne-50 transition">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-brown-900">Best Seller</span>
                  <span className="text-[10px] text-brown-500">Top customer favorite</span>
                </div>
              </label>

              {/* Published */}
              <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-champagne-200 bg-cream-50/50 cursor-pointer hover:bg-champagne-50 transition">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-brown-900">Published</span>
                  <span className="text-[10px] text-brown-500">Live on website</span>
                </div>
              </label>

            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-champagne-200 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-brown-600 hover:bg-cream-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{uploadProgress || 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
