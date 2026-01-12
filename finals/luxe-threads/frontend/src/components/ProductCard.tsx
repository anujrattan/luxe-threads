import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Card } from './ui';
import { RecycleIcon, SaleTagIcon, HeartIcon } from './icons';
import { StarRating } from './StarRating';
import { formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { getCssColorValue, getColorName } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { currency, isInWishlist, addToWishlist, removeFromWishlist } = useApp();
  const { showToast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  
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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking heart
    
    if (isWishlistLoading) return;
    
    setIsWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'success');
      } else {
        await addToWishlist(product.id);
        showToast('Added to wishlist', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update wishlist', 'error');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <Card 
      className="cursor-pointer animate-popIn bg-card-light-bg dark:bg-brand-surface border-gray-200/50 dark:border-white/10 border shadow-md dark:shadow-lg hover:shadow-xl transition-shadow !text-card-light-text-primary dark:text-brand-primary w-full overflow-hidden" 
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden rounded-t-xl">
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
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 max-w-[45%]">
          {discountText && (
            <div className="text-[10px] sm:text-xs font-semibold text-white bg-badge-pink-bg rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-md truncate">
              {discountText}
            </div>
          )}
        </div>
        {/* Top Right: Sale Badge & Wishlist */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          {onSale && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-2 py-1 shadow-lg animate-pulse">
              <SaleTagIcon className="w-3 h-3" />
              <span className="text-xs font-bold">SALE</span>
            </div>
          )}
          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full transition-all duration-200 ${
              inWishlist 
                ? 'bg-pink-500 text-white shadow-lg' 
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
            } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <HeartIcon 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`}
            />
          </button>
        </div>
      </div>
      <div className="p-2 sm:p-3 flex flex-col min-w-0">
        {categoryName && (
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600 truncate">
            {categoryName}
          </p>
        )}
        {(product.title || product.name) && (
          <h3 className="text-sm sm:text-base font-bold text-card-light-text-primary truncate mt-0.5">
            {product.title || product.name}
          </h3>
        )}
        
        {/* Rating Display */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={product.rating} readonly size="sm" />
            <span className="text-xs text-card-light-text-secondary">
              ({product.rating_count || 0})
            </span>
          </div>
        )}
        
        {product.description && (
          <p className="text-xs text-card-light-text-secondary mt-1 h-8 overflow-hidden line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-1.5">
          <p className="text-xl sm:text-2xl font-extrabold text-pink-500 truncate">
            {formatCurrency(finalPrice, currency)}
          </p>
          {hasAnyDiscount && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <p className="text-xs sm:text-sm text-card-light-text-secondary line-through">
                {formatCurrency(sellingPrice, currency)}
              </p>
              <span className="text-xs font-semibold text-pink-500 whitespace-nowrap">
                ({effectiveDiscount.toFixed(0)}% off)
              </span>
            </div>
          )}
        </div>
        
        {uspTag && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-tag-green-bg text-tag-green-text text-xs font-semibold rounded-full px-2.5 py-1 self-start max-w-full">
            <RecycleIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{uspTag}</span>
          </div>
        )}
        
        {/* Color Swatches */}
        {product.variants?.colors && product.variants.colors.length > 0 && (
          <div className="mt-2 flex items-start gap-2 overflow-hidden">
            <span className="text-xs text-card-light-text-secondary flex-shrink-0">Colors:</span>
            <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
              {product.variants.colors.slice(0, 4).map((color, index) => (
                <span
                  key={index}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: getCssColorValue(color) }}
                  title={getColorName(color)}
                />
              ))}
              {product.variants.colors.length > 4 && (
                <span className="text-xs text-card-light-text-secondary flex-shrink-0">
                  +{product.variants.colors.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};