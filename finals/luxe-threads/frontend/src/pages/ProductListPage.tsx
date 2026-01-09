import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { PackageIcon, StarIcon } from '../components/icons';
import { Button } from '../components/ui';

export const ProductListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  if (!slug) {
    return <div>Category not found</div>;
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await api.getProducts(slug);
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [slug]);

  const categoryName = slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight text-brand-primary">{categoryName}</h1>
        {/* Placeholder for filter/sort controls */}
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select className="bg-brand-surface border-white/20 rounded-lg shadow-sm focus:border-brand-accent focus:ring-brand-accent">
            <option>Sort by</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="hidden lg:block">
          <h2 className="text-lg font-display font-semibold mb-4 text-brand-primary">Filters</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-brand-primary">Size</h3>
              <div className="space-y-2">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <div key={size} className="flex items-center">
                    <input type="checkbox" id={`size-${size}`} className="h-4 w-4 rounded bg-brand-surface border-white/20 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor={`size-${size}`} className="ml-3 text-sm text-brand-secondary">{size}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-brand-primary">Color</h3>
              <div className="space-y-2">
                 {['Black', 'White', 'Gray', 'Blue'].map(color => (
                  <div key={color} className="flex items-center">
                    <input type="checkbox" id={`color-${color}`} className="h-4 w-4 rounded bg-brand-surface border-white/20 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor={`color-${color}`} className="ml-3 text-sm text-brand-secondary">{color}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-brand-primary">Price Range</h3>
              <input type="range" className="w-full accent-brand-accent" />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-brand-surface animate-pulse aspect-[4/5] rounded-lg"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 col-span-full">
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <PackageIcon className="w-20 h-20 mx-auto text-brand-secondary opacity-40" />
                  <StarIcon className="w-8 h-8 absolute -top-2 -right-2 text-purple-400 opacity-60 animate-pulse" filled={true} />
                </div>
                <h3 className="text-2xl font-display font-semibold text-brand-primary mb-3">
                  Coming Soon to {categoryName}
                </h3>
                <p className="text-brand-secondary mb-6 leading-relaxed">
                  We're curating something special for this collection. 
                  Check back soon for premium pieces that match your style.
                </p>
                <Button 
                  onClick={() => navigate('/categories')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Explore Other Collections
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};