import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const { categories, products } = useShop();

  return (
    <div className="min-h-screen bg-cream-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Categories</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-950">
            Jewellery Collections
          </h1>
          <p className="text-xs sm:text-sm text-brown-600 mt-2">
            Explore our curated collections of bridal jewellery, traditional temple ornaments, chokers, jhumkas, and accessories.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category) => {
            const itemCount = products.filter((p) => p.category_id === category.id).length;

            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-champagne-200/80 shadow-soft hover:shadow-gold transition-all duration-300 block transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-brown-900 overflow-hidden">
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      {itemCount} {itemCount === 1 ? 'Design' : 'Designs'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-brown-950 group-hover:text-champagne-700 transition">
                      {category.name}
                    </h3>
                    <p className="text-xs text-brown-500 mt-1">
                      Browse all {category.name.toLowerCase()}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-champagne-100 group-hover:bg-champagne-600 group-hover:text-white text-champagne-700 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};
