import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { formatINR, getJewelleryImageUrl, supabase } from '../../lib/supabase';
import { Product } from '../../types';
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, fetchProducts } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesSlug = prod.slug?.toLowerCase().includes(query);
        const matchesCat = prod.category?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesCat) return false;
      }

      if (selectedCategory && prod.category_id !== selectedCategory) {
        return false;
      }

      if (availabilityFilter === 'in-stock' && !prod.available) return false;
      if (availabilityFilter === 'out-of-stock' && prod.available) return false;

      return true;
    });
  }, [products, searchTerm, selectedCategory, availabilityFilter]);

  // Toggle availability in Supabase
  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !current, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert('Could not update status: ' + error.message);
      }
    } catch (e: any) {
      alert('Error updating availability: ' + e.message);
    }
  };

  // Toggle published status in Supabase
  const togglePublished = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: !current, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert('Could not update status: ' + error.message);
      }
    } catch (e: any) {
      alert('Error updating published status: ' + e.message);
    }
  };

  // Delete product and associated images
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Delete image from Supabase Storage if it's a storage path
      if (
        productToDelete.image_url &&
        !productToDelete.image_url.startsWith('http') &&
        !productToDelete.image_url.startsWith('data:')
      ) {
        await supabase.storage.from('jewellery-images').remove([productToDelete.image_url]);
      }

      // 2. Delete product record from database
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);

      if (error) {
        setDeleteError('Failed to delete product: ' + error.message);
        setIsDeleting(false);
        return;
      }

      // Realtime subscription will automatically remove it from the client catalogue
      setProductToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'An unexpected error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
            Jewellery Products ({products.length})
          </h1>
          <p className="text-xs text-brown-500 mt-1">
            Manage your entire inventory, prices, photographs, and availability in real time.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-champagne-600 via-champagne-700 to-amber-700 hover:from-champagne-700 hover:to-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Jewellery</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-champagne-200/90 shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by title, tag, slug, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-champagne-200 text-xs text-brown-900 bg-cream-50/40 focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
            <Search className="w-4 h-4 text-brown-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-brown-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-champagne-200 text-xs text-brown-900 bg-cream-50/40 focus:outline-none focus:ring-2 focus:ring-champagne-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl border border-champagne-200 text-xs text-brown-900 bg-cream-50/40 focus:outline-none focus:ring-2 focus:ring-champagne-500"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Products Table (Desktop) & Responsive Cards (Mobile) */}
      <div className="bg-white rounded-3xl border border-champagne-200/90 shadow-soft overflow-hidden">
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="font-serif text-base font-bold text-brown-900 mb-1">No matching products found</p>
            <p className="text-xs text-brown-500 mb-4">Try clearing filters or search query.</p>
            {(searchTerm || selectedCategory || availabilityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setAvailabilityFilter('all');
                }}
                className="px-4 py-1.5 rounded-full bg-champagne-600 text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-brown-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Badges</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-cream-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getJewelleryImageUrl(product.image_url)}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-champagne-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-brown-950 font-serif text-sm">{product.name}</p>
                            <p className="text-[10px] text-brown-400 font-mono mt-0.5">/{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-brown-700">
                        {product.category?.name || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brown-950 text-sm font-serif">
                          {formatINR(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="block text-[10px] text-brown-400 line-through">
                            {formatINR(product.original_price)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.is_new_arrival && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {product.is_best_seller && (
                            <span className="bg-brown-100 text-brown-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Best Seller
                            </span>
                          )}
                          {!product.is_new_arrival && !product.is_best_seller && (
                            <span className="text-brown-400 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleAvailability(product.id, product.available)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                            product.available
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{product.available ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => togglePublished(product.id, product.is_published)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            product.is_published
                              ? 'bg-champagne-100 text-champagne-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.is_published ? 'Visible' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/product/${product.slug || product.id}`}
                            target="_blank"
                            className="p-1.5 text-brown-500 hover:text-brown-900 rounded-lg hover:bg-cream-100 transition"
                            title="Preview customer view"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-1.5 text-champagne-700 hover:text-champagne-900 rounded-lg hover:bg-champagne-50 transition"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-champagne-100">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 flex space-x-3 items-start">
                  <img
                    src={getJewelleryImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-champagne-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-serif font-bold text-brown-950 text-sm truncate">{product.name}</p>
                      <span className="font-bold text-brown-950 text-sm font-serif pl-2">
                        {formatINR(product.price)}
                      </span>
                    </div>

                    <p className="text-[11px] text-brown-500 mt-0.5">{product.category?.name || 'General'}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => toggleAvailability(product.id, product.available)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          product.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {product.available ? '● In Stock' : '● Sold Out'}
                      </button>

                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-1 text-champagne-700 hover:text-champagne-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-champagne-300 relative text-left">
            <button
              onClick={() => setProductToDelete(null)}
              className="absolute top-4 right-4 text-brown-400 hover:text-brown-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-brown-950 text-base">Confirm Product Deletion</h3>
                <p className="text-xs text-brown-500">This action will remove the jewellery permanently</p>
              </div>
            </div>

            <p className="text-xs text-brown-700 leading-relaxed mb-4">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? It will immediately disappear from the live catalogue and customer WhatsApp links will show as discontinued.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-brown-600 hover:bg-brown-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
