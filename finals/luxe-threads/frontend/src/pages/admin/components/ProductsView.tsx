import React, { useState } from 'react';
import { Product, Category } from '../../../types';
import { Button, Card } from '../../../components/ui';
import { PackageIcon, PlusIcon, EditIcon, TrashIcon, TagIcon } from '../../../components/icons';
import { formatCurrency } from '../../../utils/currency';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  currency: string;
  failedProductImages: Set<string>;
  onImageError: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  loading,
  currency,
  failedProductImages,
  onImageError,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <PackageIcon className="w-16 h-16 mx-auto mb-4 text-brand-secondary opacity-50" />
        <h3 className="text-xl font-semibold text-brand-primary mb-2">No Products Yet</h3>
        <p className="text-brand-secondary mb-6">Add your first product to start selling</p>
        <Button onClick={onAddNew} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <PlusIcon className="w-5 h-5 inline mr-2" />
          Create Product
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <tr>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Variants</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-brand-surface divide-y divide-white/10">
            {products.map((product, index) => (
              <tr 
                key={product.id} 
                className="hover:bg-white/5 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-start gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-colors">
                      {product.imageUrl && !failedProductImages.has(product.id) ? (
                        <img 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          src={product.imageUrl} 
                          alt={product.name}
                          onError={() => onImageError(product.id)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-brand-primary group-hover:text-purple-400 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-brand-secondary mt-1 line-clamp-2 max-w-md">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-baseline justify-start gap-2">
                    <span className="text-lg font-bold text-pink-500">{formatCurrency(product.price, currency)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-brand-secondary line-through">
                        {formatCurrency(product.originalPrice, currency)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">
                    <TagIcon className="w-3 h-3" />
                    {categories.find(c => c.slug === product.category)?.name || product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {product.variants && (
                    <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      {product.variants.sizes?.length || 0} sizes, {product.variants.colors?.length || 0} colors
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => onEdit(product)}
                      className="p-2 hover:bg-purple-500/10"
                      aria-label="Edit product"
                    >
                      <EditIcon className="w-4 h-4 text-brand-secondary group-hover:text-purple-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => onDelete(product.id)}
                      className="p-2 hover:bg-red-500/10"
                      aria-label="Delete product"
                    >
                      <TrashIcon className="w-4 h-4 text-brand-secondary group-hover:text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

