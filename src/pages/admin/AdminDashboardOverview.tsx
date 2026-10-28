import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { formatINR, getJewelleryImageUrl, supabase } from '../../lib/supabase';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Tag,
  PlusCircle,
  Eye,
  Edit,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  const { products, offers, settings, loading, fetchProducts, realtimeConnected } = useShop();

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.available).length;
  const outOfStockProducts = totalProducts - availableProducts;
  const activeOffers = offers.filter((o) => o.is_active).length;

  const recentlyAdded = products.slice(0, 5);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert('Failed to update status: ' + error.message);
      } else {
        // Supabase Realtime subscription will automatically update the state!
      }
    } catch (e: any) {
      alert('Error updating availability: ' + e.message);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-brown-900 via-brown-950 to-brown-900 rounded-3xl p-6 sm:p-8 text-white border border-champagne-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-champagne-500/20 text-champagne-300 text-xs font-semibold px-3 py-1 rounded-full border border-champagne-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Administration Console</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Welcome to {settings.shop_name}
          </h1>
          <p className="text-xs sm:text-sm text-cream-300 mt-1 max-w-xl">
            Add new jewellery photos, manage rupee prices, toggle stock, and launch festive offers. All updates sync instantly to all customers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-champagne-500 to-amber-600 hover:from-champagne-600 hover:to-amber-700 text-brown-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Jewellery</span>
          </Link>

          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-xs border border-white/20 transition"
          >
            <span>View Published Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-champagne-200/90 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brown-500 uppercase tracking-wider">Total Jewellery</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-brown-950 mt-1">{totalProducts}</p>
            <span className="text-[11px] text-champagne-700 font-medium">Published in catalogue</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-champagne-200/90 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brown-500 uppercase tracking-wider">In Stock</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">{availableProducts}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for dispatch</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-champagne-200/90 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brown-500 uppercase tracking-wider">Out of Stock</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-rose-700 mt-1">{outOfStockProducts}</p>
            <span className="text-[11px] text-rose-500 font-medium">Needs replenishment</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-champagne-200/90 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brown-500 uppercase tracking-wider">Active Offers</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{activeOffers}</p>
            <span className="text-[11px] text-amber-600 font-medium">Visible to customers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recently Added Products Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200/90 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-champagne-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-brown-950">
              Recently Added Jewellery
            </h2>
            <p className="text-xs text-brown-500 mt-0.5">
              Latest items listed in the database. Toggle availability status or edit details.
            </p>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex items-center space-x-1 text-xs font-bold text-champagne-700 hover:text-champagne-900"
          >
            <span>View All ({totalProducts})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentlyAdded.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-champagne-300 rounded-2xl bg-cream-50/50">
            <Package className="w-10 h-10 text-champagne-600 mx-auto mb-2 opacity-80" />
            <p className="font-serif text-base font-bold text-brown-900">No products added yet</p>
            <p className="text-xs text-brown-500 max-w-sm mx-auto mt-1 mb-4">
              Get started by uploading your first jewellery photograph, setting the rupee price, and publishing it!
            </p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center space-x-1.5 bg-champagne-600 hover:bg-champagne-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100/70 text-brown-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Jewellery Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Added On</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100">
                {recentlyAdded.map((product) => (
                  <tr key={product.id} className="hover:bg-cream-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getJewelleryImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-champagne-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-brown-900 line-clamp-1">{product.name}</p>
                          <span className="text-[10px] text-brown-400 font-mono">{product.slug || product.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-brown-700">
                      {product.category?.name || 'General'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brown-950 font-serif">
                      {formatINR(product.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleAvailability(product.id, product.available)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          product.available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <span>{product.available ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-brown-500 text-[11px]">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          target="_blank"
                          className="p-1 text-brown-500 hover:text-brown-900 transition"
                          title="View on customer site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-1 text-champagne-700 hover:text-champagne-900 transition"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
