import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product, CartItem } from '../types';
import api from '../services/api';
import { Button } from '../components/ui';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useApp();
  
  // All hooks must be declared before any conditional returns
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      const data = await api.getProductById(id);
      if (data) {
        setProduct(data);
        // Set initial color (first available color)
        const initialColor = data.variants.colors && data.variants.colors.length > 0 
          ? data.variants.colors[0] 
          : '';
        setSelectedColor(initialColor);
        // Set initial size (first available size)
        const initialSize = data.variants.sizes && data.variants.sizes.length > 0 
          ? data.variants.sizes[0] 
          : '';
        setSelectedSize(initialSize);
        // Set initial image (main image)
        setSelectedImage(data.main_image_url || data.imageUrl || '');
        
        const allProducts = await api.getProducts(data.category);
        setRelatedProducts(allProducts.filter(p => p.id !== data.id).slice(0, 4));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Update selected image when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const variantsWithMockups = product?.variants_with_mockups;
      const mockupImagesForColor = selectedColor && variantsWithMockups?.[selectedColor] 
        ? variantsWithMockups[selectedColor] 
        : [];
      
      const colorImages = [
        product.main_image_url || product.imageUrl || '',
        ...mockupImagesForColor.slice(0, 4)
      ].filter(img => img);
      
      if (colorImages.length > 0) {
        // Update to first image for this color
        setSelectedImage(colorImages[0]);
      }
    }
  }, [selectedColor, product]);

  // Early return after all hooks are declared
  if (!id) {
    return <div>Product not found</div>;
  }

  if (loading) {
    return <div className="text-center py-20 text-brand-secondary">Loading product...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-brand-secondary">Product not found.</div>;
  }

  // Calculate prices like ProductCard does (only when product exists)
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
  
  // Calculate effective discount percentage for display
  const effectiveDiscount = discountPercentage > 0 || saleDiscountPercentage > 0
    ? 100 - (100 - discountPercentage) * (100 - saleDiscountPercentage) / 100
    : 0;

  // Get mockup images for selected color
  const variantsWithMockups = product?.variants_with_mockups;
  const mockupImagesForColor = selectedColor && variantsWithMockups?.[selectedColor] 
    ? variantsWithMockups[selectedColor] 
    : [];
  
  // Combine main image + mockup images (max 5 total: 1 main + 4 mockups)
  const allImages = [
    product.main_image_url || product.imageUrl || '',
    ...mockupImagesForColor.slice(0, 4)
  ].filter(img => img); // Remove empty strings

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity: 1,
        selectedSize,
        selectedColor,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  // Filter colors to only show those that exist in variants
  const availableColors = product.variants?.colors || [];
  
  // Filter sizes to only show those that exist in variants
  const availableSizes = product.variants?.sizes || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Section */}
        <div>
          {/* Main Product Image - Reduced by 40% (60% of original size) */}
          <div className="w-full" style={{ maxWidth: '60%', margin: '0 auto' }}>
            <img 
              src={selectedImage || product.main_image_url || product.imageUrl || ''} 
              alt={product.name || product.title} 
              className="w-full h-auto object-contain rounded-xl shadow-lg border border-white/10" 
            />
          </div>
          
          {/* Mockup Images Grid - Below main image */}
          {allImages.length > 1 && (
            <div className="mt-4">
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === imageUrl
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-white/20 hover:border-purple-400/50'
                    }`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`${product.name} ${index === 0 ? 'main' : `mockup ${index}`}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details - Aligned with top of image */}
        <div className="flex flex-col">
          <h1 className="text-3xl lg:text-5xl font-display font-bold tracking-tight text-brand-primary">
            {product.name || product.title}
          </h1>
          
          {/* Price Display */}
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-pink-500">
              ${finalPrice.toFixed(2)}
            </p>
            {hasAnyDiscount && (
              <>
                <p className="text-xl text-brand-secondary line-through">
                  ${sellingPrice.toFixed(2)}
                </p>
                <span className="text-lg font-semibold text-pink-500">
                  ({effectiveDiscount.toFixed(0)}% off)
                </span>
              </>
            )}
          </div>
          
          <p className="mt-6 text-base text-brand-secondary leading-relaxed">{product.description}</p>
          
          <div className="mt-8 space-y-6">
            {/* Color Selector - Only show colors that exist */}
            {availableColors.length > 0 && availableColors[0] !== 'N/A' && (
              <div>
                <h3 className="text-sm font-medium text-brand-primary">
                  Color: <span className="font-bold">{selectedColor}</span>
                </h3>
                <div className="flex items-center space-x-3 mt-2">
                  {availableColors.map(color => {
                    // Get mockup images for this color to update main image when selected
                    const colorMockups = variantsWithMockups?.[color] || [];
                    const colorMainImage = product.main_image_url || product.imageUrl || '';
                    const colorImages = [colorMainImage, ...colorMockups.slice(0, 4)].filter(img => img);
                    
                    return (
                      <button 
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          // Update main image to first available image for this color
                          if (colorImages.length > 0) {
                            setSelectedImage(colorImages[0]);
                          }
                        }}
                        className={`relative -m-0.5 flex items-center justify-center rounded-full p-0.5 focus:outline-none transition-transform transform hover:scale-110 ${
                          selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-brand-accent ring-offset-brand-bg' 
                            : ''
                        }`}
                      >
                        <span 
                          className={`h-8 w-8 rounded-full border border-white/20`} 
                          style={{ backgroundColor: color }}
                        ></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector - Only show sizes that exist */}
            {availableSizes.length > 0 && availableSizes[0] !== 'One Size' && availableSizes[0] !== '11oz' && (
              <div>
                <h3 className="text-sm font-medium text-brand-primary">Size</h3>
                <div className="grid grid-cols-4 gap-4 mt-2 sm:grid-cols-8 lg:grid-cols-5">
                  {availableSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`group relative flex items-center justify-center rounded-lg border py-3 px-4 text-sm font-medium uppercase transition-all duration-200 ease-in-out focus:outline-none sm:flex-1 ${
                        selectedSize === size 
                          ? 'bg-brand-accent text-white shadow-md border-brand-accent' 
                          : 'bg-brand-surface text-brand-primary hover:bg-white/10 border-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={handleAddToCart} className="mt-10 w-full py-3 text-base">
            {addedToCart ? 'Added!' : 'Add to cart'}
          </Button>
        </div>
      </div>

      {/* You May Also Like */}
      <div className="mt-24">
        <h2 className="text-2xl font-display font-bold tracking-tight text-brand-primary">You may also like</h2>
        <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
          {relatedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};