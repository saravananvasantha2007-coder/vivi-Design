import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const fallbackCollections = [
  {
    name: 'Necklace Sets',
    slug: 'necklace-sets',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    description: 'Chokers, rani haars & matching earring sets',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    description: 'Jhumkas, chandbalis, studs & drops',
  },
  {
    name: 'Bridal Jewellery',
    slug: 'bridal-jewellery',
    image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=80',
    description: 'Complete royal bridal adornments',
  },
  {
    name: 'Traditional Jewellery',
    slug: 'traditional-jewellery',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    description: 'South Indian temple & kundan heritage pieces',
  },
  {
    name: 'Bangles',
    slug: 'bangles',
    image_url: 'https://images.unsplash.com/photo-1611591475806-a831e50f58aa?auto=format&fit=crop&w=600&q=80',
    description: 'Kadas, silk thread & micro-plated bangles',
  },
  {
    name: 'Rings',
    slug: 'rings',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    description: 'Adjustable statement rings & cocktail designs',
  },
  {
    name: 'Jewellery Accessories',
    slug: 'jewellery-accessories',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    description: 'Maang tikka, waist belts & hair accessories',
  },
];

export const FeaturedCollections: React.FC = () => {
  const { categories } = useShop();

  // Use database categories if available, else fallback list
  const displayCategories = categories.length > 0 ? categories : fallbackCollections;

  return (
    <section className="py-16 md:py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-champagne-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brown-950">
            Explore By Category
          </h2>
          <p className="text-sm text-brown-600 mt-3">
            Handmade with love, each category offers timeless designs suited for festive celebrations, weddings, and everyday grace.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayCategories.map((cat: any) => {
            const targetUrl = cat.id
              ? `/shop?category=${cat.id}`
              : `/shop?categoryName=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={cat.slug || cat.name}
                to={targetUrl}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-brown-900 border border-champagne-300/40 shadow-soft hover:shadow-gold transition-all duration-300 block transform hover:-translate-y-1"
              >
                {/* Background Image */}
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />

                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-brown-950 via-brown-950/40 to-transparent group-hover:via-brown-950/20 transition-all duration-300" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                  <h3 className="font-serif text-base sm:text-lg font-bold group-hover:text-champagne-300 transition leading-snug">
                    {cat.name}
                  </h3>
                  
                  {cat.description && (
                    <p className="text-[11px] text-cream-200 line-clamp-1 mt-0.5 opacity-90 hidden sm:block">
                      {cat.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center space-x-1 text-champagne-300 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-200">
                    <span>View Designs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
