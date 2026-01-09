import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Card } from './ui';
import { RecycleIcon, SaleTagIcon } from './icons';
import { formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { getCssColorValue } from '../utils/colorUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { currency } = useApp();
  const [imageError, setImageError] = useState(false);
  
  // Calculate prices exactly like ProductCardPreview
  const sellingPrice = parseFloat(String(product.selling_price || 0));
  const discountPercentage = product.discount_percentage ? parseFloat(String(product.discount_percentage)) : 0;
  const onSale = product.on_sale === true;
  const saleDiscountPercentage = onSale && product.sale_discount_percentage ? parseFloat(String(product.sale_discount_percentage)) : 0;
  
  // Calculate final price with multiplicative stacking
  let finalPrice = sellingPrice;
  if (discountPercentage > 0) {
    finalPrice = finalPrice * (1 - discountPercentage / 100);
  }
  if (saleDiscountPercentage > 0) {
    finalPrice = finalPrice * (1 - saleDiscountPercentage / 100);
  }
  
  const hasAnyDiscount = discountPercentage > 0 || saleDiscountPercentage > 0;
  const totalSavings = sellingPrice - finalPrice;
  
  // Calculate effective discount percentage for display
  const effectiveDiscount = discountPercentage > 0 || saleDiscountPercentage > 0
    ? 100 - (100 - discountPercentage) * (100 - saleDiscountPercentage) / 100
    : 0;
  
  // Get category name - use category slug if available
  const categoryName = product.category 
    ? product.category.toUpperCase().replace('-', ' ')
    : undefined;
  
  const discountText = hasAnyDiscount ? `Save ${formatCurrency(totalSavings, currency, { showDecimals: false })}` : undefined;
  const uspTag = product.usp_tag || undefined;

  return (
    <Card 
      className="cursor-pointer animate-popIn bg-card-light-bg dark:bg-brand-surface border-gray-200/50 dark:border-white/10 border shadow-md dark:shadow-lg hover:shadow-xl transition-shadow !text-card-light-text-primary dark:text-brand-primary max-w-sm" 
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
        {(product.main_image_url || product.imageUrl) && !imageError ? (
          <img
            src={product.main_image_url || product.imageUrl}
            alt={product.title || product.name || 'Product'}
            className="w-full h-full object-cover"
            onError={() => {
              // Stop retrying - just mark as error and show fallback
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
          </div>
        )}
        {/* Top Left: Discount Pill */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {discountText && (
            <div className="text-xs font-semibold text-white bg-badge-pink-bg rounded-full px-2.5 py-1 shadow-md">
              {discountText}
            </div>
          )}
        </div>
        {/* Top Right: Sale Badge */}
        {onSale && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-2 py-1 shadow-lg animate-pulse">
              <SaleTagIcon className="w-3 h-3" />
              <span className="text-xs font-bold">SALE</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col">
        {categoryName && (
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
            {categoryName}
          </p>
        )}
        {(product.title || product.name) && (
          <h3 className="text-base font-bold text-card-light-text-primary truncate mt-0.5">
            {product.title || product.name}
          </h3>
        )}
        {product.description && (
          <p className="text-xs text-card-light-text-secondary mt-1 h-8 overflow-hidden line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-2xl font-extrabold text-pink-500">
            {formatCurrency(finalPrice, currency)}
          </p>
          {hasAnyDiscount && (
            <div className="flex items-baseline gap-1.5">
              <p className="text-sm text-card-light-text-secondary line-through">
                {formatCurrency(sellingPrice, currency)}
              </p>
              <span className="text-xs font-semibold text-pink-500">
                ({effectiveDiscount.toFixed(0)}% off)
              </span>
            </div>
          )}
        </div>
        
        {uspTag && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-tag-green-bg text-tag-green-text text-xs font-semibold rounded-full px-2.5 py-1 self-start">
            <RecycleIcon className="w-3 h-3" />
            <span>{uspTag}</span>
          </div>
        )}
        
        {/* Color Swatches */}
        {product.variants?.colors && product.variants.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-card-light-text-secondary">Colors:</span>
            <div className="flex gap-1.5 flex-wrap">
              {product.variants.colors.slice(0, 6).map((color, index) => (
                <span
                  key={index}
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: getCssColorValue(color) }}
                  title={color}
                />
              ))}
              {product.variants.colors.length > 6 && (
                <span className="text-xs text-card-light-text-secondary">
                  +{product.variants.colors.length - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};