import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/product/ProductCard';
import { Search, Filter, Sparkles, RefreshCw, SlidersHorizontal, CheckCircle2, X } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { products, categories, settings, loading, refreshAll, realtimeConnected } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || ''; // 'new' | 'bestseller'
  const categoryNameParam = searchParams.get('categoryName') || '';

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync state if URL query params change
  React.useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (categoryNameParam && categories.length > 0) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === categoryNameParam.toLowerCase()
      );
      if (match) setSelectedCategory(match.id);
    }
  }, [categoryParam, categoryNameParam, categories]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query) || false;
        const matchesCategory = product.category?.name.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      // Category filter
      if (selectedCategory) {
        if (product.category_id !== selectedCategory && product.category?.slug !== selectedCategory) {
          return false;
        }
      }

      // Special Filter
      if (filterParam === 'new' && !product.is_new_arrival) {
        return false;
      }
      if (filterParam === 'bestseller' && !product.is_best_seller) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && !product.available) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, searchTerm, selectedCategory, filterParam, onlyAvailable, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setOnlyAvailable(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-cream-50 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs text-champagne-800 font-semibold tracking-wider uppercase mb-1">
            <span>Catalogue</span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>Realtime Connected</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-950">
                Jewellery Collection
              </h1>
              <p className="text-xs sm:text-sm text-brown-600 mt-1">
                Explore handpicked bridal sets, temple jewellery, jhumkas, and accessories.
              </p>
            </div>

            <button
              onClick={() => refreshAll()}
              className="self-start sm:self-auto inline-flex items-center space-x-1.5 text-xs text-brown-700 bg-white hover:bg-champagne-50 border border-champagne-300 px-3.5 py-2 rounded-full transition shadow-sm"
              title="Refresh catalogue from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Catalogue</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-champagne-200/80 shadow-soft mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                placeholder="Search necklace, earrings, bangles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-champagne-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-cream-50/50 text-brown-900"
              />
              <Search className="w-4 h-4 text-brown-400 absolute left-3 top-3" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-brown-400 hover:text-brown-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value) {
                    setSearchParams({ category: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-champagne-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-cream-50/50 text-brown-900"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl border border-champagne-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-cream-50/50 text-brown-900"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* In-Stock Filter Toggle */}
            <div className="md:col-span-2 flex items-center justify-between sm:justify-end space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-brown-800">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-champagne-600 focus:ring-champagne-500 w-4 h-4 accent-champagne-600 cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>

              {(searchTerm || selectedCategory || onlyAvailable || filterParam) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium underline pl-2"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchParams({});
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition ${
                !selectedCategory
                  ? 'bg-brown-900 text-champagne-200 shadow-sm'
                  : 'bg-cream-100 text-brown-700 hover:bg-champagne-100'
              }`}
            >
              All Designs ({products.length})
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setSearchParams({ category: c.id });
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition ${
                    isSelected
                      ? 'bg-brown-900 text-champagne-200 shadow-sm'
                      : 'bg-cream-100 text-brown-700 hover:bg-champagne-100'
                  }`}
                >
                  {c.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-champagne-100 p-4 flex flex-col justify-between">
                <div className="bg-cream-200 rounded-xl w-full h-48" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-cream-200 rounded w-3/4" />
                  <div className="h-4 bg-cream-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State when Database has No Products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24 px-4 bg-white rounded-3xl border border-champagne-200 shadow-soft max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-champagne-100 text-champagne-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brown-950 mb-2">
              New jewellery collections are coming soon!
            </h2>
            <p className="text-sm text-brown-600 mb-6 max-w-md mx-auto leading-relaxed">
              We are updating our catalogue with fresh handcrafted designs. Please check back shortly or connect with the shop owner via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20VIVI%20Creations!%20When%20will%20new%20jewellery%20designs%20be%20available?`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-3 rounded-full text-xs font-semibold shadow-md transition"
            >
              <span>Message Shop on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Empty State when Search/Filter returns 0 results */}
        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-champagne-200 max-w-md mx-auto my-8">
            <p className="font-serif text-lg font-bold text-brown-900 mb-1">
              No matching jewellery found
            </p>
            <p className="text-xs text-brown-500 mb-4">
              Try adjusting your search keywords or clear current category filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2 rounded-full bg-champagne-600 text-white text-xs font-semibold hover:bg-champagne-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && displayedProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} settings={settings} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="bg-white hover:bg-champagne-50 text-brown-900 border border-champagne-300 font-semibold px-8 py-3 rounded-full text-xs shadow-sm hover:shadow transition"
                >
                  Load More Jewellery ({filteredProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
