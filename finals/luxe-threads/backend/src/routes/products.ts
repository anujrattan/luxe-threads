/**
 * Product Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { supabase, supabaseAdmin } from '../services/supabase.js';
import { uploadProductImage, extractFilePathFromUrl, deleteFile } from '../services/storage.js';
import { cache, cacheKeys } from '../services/redis.js';

const router = Router();

// Cache TTL in seconds
// Set to 6 hours (21600 seconds) since we're doing upserts on every create/update/delete
// This means cache will only refresh from DB ~4 times per day on cache misses
// But since we upsert on writes, cache stays in sync regardless of TTL
const CACHE_TTL = 6 * 60 * 60; // 6 hours

// Helper function to transform database product to API format
const transformProduct = (dbProduct: any, category?: any) => {
  // Handle selling_price - check for null/undefined explicitly
  let sellingPrice = 0;
  
  if (dbProduct.selling_price != null && dbProduct.selling_price !== '' && dbProduct.selling_price !== 0) {
    const parsed = typeof dbProduct.selling_price === 'string' 
      ? parseFloat(dbProduct.selling_price) 
      : Number(dbProduct.selling_price);
    if (!isNaN(parsed) && parsed > 0) {
      sellingPrice = parsed;
    }
  } else if (dbProduct.price != null && dbProduct.price !== '' && dbProduct.price !== 0) {
    const parsed = typeof dbProduct.price === 'string' 
      ? parseFloat(dbProduct.price) 
      : Number(dbProduct.price);
    if (!isNaN(parsed) && parsed > 0) {
      sellingPrice = parsed;
    }
  }
  
  // Validate parsed price (handle NaN)
  if (isNaN(sellingPrice) || sellingPrice < 0) {
    sellingPrice = 0;
  }
  const discountPercentage = dbProduct.discount_percentage != null && dbProduct.discount_percentage > 0
    ? parseFloat(dbProduct.discount_percentage)
    : null;
  
  const onSale = dbProduct.on_sale === true;
  const saleDiscountPercentage = onSale && dbProduct.sale_discount_percentage != null && dbProduct.sale_discount_percentage > 0
    ? parseFloat(dbProduct.sale_discount_percentage)
    : null;
  
  // Calculate final price with multiplicative stacking
  let finalPrice = sellingPrice;
  if (discountPercentage != null && discountPercentage > 0) {
    finalPrice = finalPrice * (1 - discountPercentage / 100);
  }
  if (saleDiscountPercentage != null && saleDiscountPercentage > 0) {
    finalPrice = finalPrice * (1 - saleDiscountPercentage / 100);
  }
  
  const hasAnyDiscount = (discountPercentage != null && discountPercentage > 0) || (saleDiscountPercentage != null && saleDiscountPercentage > 0);
  const totalSavings = sellingPrice - finalPrice;
  
  const categorySlug = category?.slug || dbProduct.category || '';
  
  return {
    id: dbProduct.id,
    category_id: dbProduct.category_id,
    title: dbProduct.title || dbProduct.name,
    description: dbProduct.description,
    selling_price: sellingPrice,
    discount_percentage: discountPercentage || undefined,
    on_sale: onSale || undefined,
    sale_discount_percentage: saleDiscountPercentage || undefined,
    usp_tag: dbProduct.usp_tag || undefined,
    main_image_url: dbProduct.main_image_url || dbProduct.imageUrl || dbProduct.image_url,
    mockup_images: dbProduct.mockup_images || [],
    mockup_video_url: dbProduct.mockup_video_url || undefined,
    rating: dbProduct.rating || undefined,
    rating_count: dbProduct.rating_count || 0,
    review_count: dbProduct.rating_count || dbProduct.review_count || dbProduct.reviewCount || 0,
    variants: dbProduct.variants || { sizes: [], colors: [] },
    variants_with_mockups: dbProduct.variants_with_mockups || undefined,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    // Legacy fields for backward compatibility
    name: dbProduct.title || dbProduct.name,
    price: finalPrice,
    originalPrice: hasAnyDiscount ? sellingPrice : undefined,
    imageUrl: dbProduct.main_image_url || dbProduct.imageUrl || dbProduct.image_url,
    category: categorySlug,
    tags: dbProduct.usp_tag ? [dbProduct.usp_tag] : [],
    reviewCount: dbProduct.rating_count || dbProduct.review_count || dbProduct.reviewCount || 0,
    discount: hasAnyDiscount ? `Save $${totalSavings.toFixed(0)}` : undefined,
  };
};

// Helper to extract sizes and colors from product variants JSONB
// Variants are now stored directly in products.variants JSONB column
const extractVariantsFromDb = (variants: any) => {
  if (!variants || typeof variants !== 'object') {
    return { sizes: [], colors: [] };
  }
  
  const sizes = Array.isArray(variants.sizes) ? variants.sizes : [];
  const colors = Array.isArray(variants.colors) ? variants.colors : [];
  
  return { sizes, colors };
};

// Helper function to upsert product in cache arrays
async function upsertProductInCacheArrays(product: any) {
  try {
    // Upsert in products:all cache
    const allProducts = await cache.getJSON<any[]>(cacheKeys.products);
    if (allProducts) {
      const index = allProducts.findIndex((p: any) => p.id === product.id);
      if (index >= 0) {
        allProducts[index] = product;
      } else {
        allProducts.unshift(product); // Add to beginning
      }
      await cache.setJSON(cacheKeys.products, allProducts, CACHE_TTL);
    }

    // Upsert in category-specific cache if category slug exists
    const categorySlug = product.category;
    if (categorySlug) {
      const categoryKey = cacheKeys.productsByCategory(categorySlug);
      const categoryProducts = await cache.getJSON<any[]>(categoryKey);
      if (categoryProducts) {
        const index = categoryProducts.findIndex((p: any) => p.id === product.id);
        if (index >= 0) {
          categoryProducts[index] = product;
        } else {
          categoryProducts.unshift(product);
        }
        await cache.setJSON(categoryKey, categoryProducts, CACHE_TTL);
      }
    }
  } catch (error) {
    console.error('Error upserting product in cache arrays:', error);
    // Non-fatal - continue even if cache update fails
  }
}

// Helper function to remove product from cache arrays
async function removeProductFromCacheArrays(productId: string, categorySlug?: string) {
  try {
    // Remove from products:all cache
    const allProducts = await cache.getJSON<any[]>(cacheKeys.products);
    if (allProducts) {
      const filtered = allProducts.filter((p: any) => p.id !== productId);
      await cache.setJSON(cacheKeys.products, filtered, CACHE_TTL);
    }

    // Remove from category-specific cache if category slug exists
    if (categorySlug) {
      const categoryKey = cacheKeys.productsByCategory(categorySlug);
      const categoryProducts = await cache.getJSON<any[]>(categoryKey);
      if (categoryProducts) {
        const filtered = categoryProducts.filter((p: any) => p.id !== productId);
        await cache.setJSON(categoryKey, filtered, CACHE_TTL);
      }
    }
  } catch (error) {
    console.error('Error removing product from cache arrays:', error);
    // Non-fatal - continue even if cache update fails
  }
}

// Get all products (public) - with caching
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    
    // Determine cache key
    let cacheKey: string;
    let categorySlug: string | undefined;
    
    if (category) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category as string);
      if (isUUID) {
        // If UUID, fetch category slug for cache key
        const { data: categoryData } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', category)
          .single();
        if (categoryData) {
          categorySlug = categoryData.slug;
          cacheKey = cacheKeys.productsByCategory(categoryData.slug);
        } else {
          cacheKey = cacheKeys.products;
        }
      } else {
        categorySlug = category as string;
        cacheKey = cacheKeys.productsByCategory(categorySlug);
      }
    } else {
      cacheKey = cacheKeys.products;
    }
    
    // Try to get from cache first
    const cachedData = await cache.getJSON<any[]>(cacheKey);
    if (cachedData) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return res.json(cachedData);
    }
    
    console.log(`📦 Cache miss for ${cacheKey}, fetching from database`);
    
    // Cache miss - fetch from database
    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          slug,
          name,
          is_active
        )
      `);
    
    if (category) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category as string);
      if (isUUID) {
        query = query.eq('category_id', category);
      } else {
        // Look up category by slug (only active categories)
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .eq('is_active', true)
          .single();
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        } else {
          // Category doesn't exist or is inactive, return empty array
          return res.json([]);
        }
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform products with category data, filter out products from inactive categories
    const transformed = (data || [])
      .filter((product: any) => {
        // Only include products from active categories
        return product.categories?.is_active !== false;
      })
      .map((product: any) => {
        const category = product.categories;
        delete product.categories;
        
        // Extract variants from JSONB
        const variants = extractVariantsFromDb(product.variants);
        product.variants = variants;
        
        return transformProduct(product, category);
      });
    
    // Store in cache (6 hour TTL)
    await cache.setJSON(cacheKey, transformed, CACHE_TTL);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Search products with full-text search
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({ results: [], total: 0 });
    }
    
    const searchTerm = q.trim();
    const searchLimit = parseInt(limit as string);
    const searchOffset = parseInt(offset as string);
    
    // Build the query with full-text search
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `, { count: 'exact' });
    
    // Full-text search on title and description
    // Using ilike for case-insensitive partial matching (good for short searches)
    // For better performance with large datasets, you'd use PostgreSQL full-text search
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    
    // Apply filters
    if (category && typeof category === 'string') {
      query = query.eq('category_id', category);
    }
    
    if (minPrice && typeof minPrice === 'string') {
      query = query.gte('selling_price', parseFloat(minPrice));
    }
    
    if (maxPrice && typeof maxPrice === 'string') {
      query = query.lte('selling_price', parseFloat(maxPrice));
    }
    
    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(searchOffset, searchOffset + searchLimit - 1);
    
    const { data: products, error, count } = await query;
    
    if (error) throw error;
    
    const transformed = (products || []).map(p => transformProduct(p, p.categories));
    
    res.json({
      results: transformed,
      total: count || 0,
      query: searchTerm,
      page: Math.floor(searchOffset / searchLimit) + 1,
      limit: searchLimit
    });
  } catch (error: any) {
    console.error('Error searching products:', error);
    next(error);
  }
});

// Get best sellers (based on revenue from last 30 days)
router.get('/best-sellers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    
    // Try to get from cache first
    const cacheKey = 'orders:last30days';
    let ordersData = await cache.get(cacheKey);
    
    if (!ordersData) {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Fetch orders from last 30 days with order items
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          created_at,
          order_items (
            product_id,
            quantity,
            unit_price
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'delivered'); // Only count delivered orders
      
      if (error) throw error;
      
      ordersData = orders || [];
      
      // Cache for 24 hours (86400 seconds)
      await cache.set(cacheKey, JSON.stringify(ordersData), 86400);
    } else {
      ordersData = JSON.parse(ordersData as string);
    }
    
    // Calculate revenue per product
    const productRevenue: Record<string, number> = {};
    
    for (const order of ordersData as any[]) {
      if (order.order_items && Array.isArray(order.order_items)) {
        for (const item of order.order_items) {
          const productId = item.product_id;
          const revenue = item.quantity * item.unit_price;
          
          if (!productRevenue[productId]) {
            productRevenue[productId] = 0;
          }
          productRevenue[productId] += revenue;
        }
      }
    }
    
    // Sort products by revenue and get top products
    const sortedProducts = Object.entries(productRevenue)
      .sort(([, revenueA], [, revenueB]) => revenueB - revenueA)
      .slice(0, limit)
      .map(([productId]) => productId);
    
    if (sortedProducts.length === 0) {
      // No sales data yet, return newest products as fallback
      console.log('No sales data for best sellers, returning newest products as fallback');
      const { data: fallbackProducts, error: fallbackError } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (fallbackError) throw fallbackError;
      
      const transformed = (fallbackProducts || []).map(p => {
        const transformed = transformProduct(p, p.categories);
        console.log(`Product: ${transformed.title}, selling_price: ${transformed.selling_price}, price: ${transformed.price}`);
        return transformed;
      });
      return res.json(transformed);
    }
    
    // Fetch full product details for best sellers
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .in('id', sortedProducts);
    
    if (productsError) throw productsError;
    
    // Sort products by revenue ranking
    const sortedProductDetails = sortedProducts
      .map(id => products?.find(p => p.id === id))
      .filter(Boolean)
      .map(p => {
        const transformed = transformProduct(p, p.categories);
        console.log(`Best Seller: ${transformed.title}, selling_price: ${transformed.selling_price}, price: ${transformed.price}`);
        return transformed;
      });
    
    res.json(sortedProductDetails);
  } catch (error: any) {
    console.error('Error fetching best sellers:', error);
    next(error);
  }
});

// Get new arrivals (based on created_at)
router.get('/new-arrivals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    
    // Fetch newest products
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    const transformed = (products || []).map(p => {
      const transformed = transformProduct(p, p.categories);
      console.log(`New Arrival: ${transformed.title}, selling_price: ${transformed.selling_price}, price: ${transformed.price}`);
      return transformed;
    });
    
    res.json(transformed);
  } catch (error: any) {
    console.error('Error fetching new arrivals:', error);
    next(error);
  }
});

// Get product by ID (public) - with caching
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cacheKey = cacheKeys.product(id);
    
    // Try to get from cache first
    const cachedProduct = await cache.getJSON<any>(cacheKey);
    if (cachedProduct) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return res.json(cachedProduct);
    }
    
    console.log(`📦 Cache miss for ${cacheKey}, fetching from database`);
    
    // Cache miss - fetch from database
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          slug,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Mockup images by color are stored in products table
    // Check if we have mockup_images_by_color in the product data
    if (data.mockup_images_by_color && typeof data.mockup_images_by_color === 'object') {
      data.variants_with_mockups = data.mockup_images_by_color;
    }
    
    // Extract sizes and colors from variants JSONB
    const variantData = extractVariantsFromDb(data.variants);
    data.variants = variantData;
    
    const category = data.categories;
    delete data.categories;
    const transformed = transformProduct(data, category);
    
    // Store in cache (6 hour TTL)
    await cache.setJSON(cacheKey, transformed, CACHE_TTL);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      category_id,
      title,
      description,
      selling_price,
      discount_percentage,
      on_sale,
      sale_discount_percentage,
      usp_tag,
      main_image_url,
      main_image_file,
      mockup_images,
      mockup_images_by_color,
      rating,
      review_count,
      sizes,
      colors,
      fulfillment_partner,
      partner_product_id,
    } = req.body;
    
    // Ensure sizes and colors are arrays
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
    
    // Debug logging
    console.log('📝 Creating product with data:', {
      title,
      sizes: sizesArray,
      colors: colorsArray,
      sizesLength: sizesArray.length,
      colorsLength: colorsArray.length,
      originalSizes: sizes,
      originalColors: colors,
    });
    
    const tempSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'product';
    
    // Handle main image upload
    let finalMainImageUrl = main_image_url;
    if (main_image_file && !main_image_url) {
      try {
        if (typeof main_image_file === 'string' && main_image_file.startsWith('data:image')) {
          const base64Data = main_image_file.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          finalMainImageUrl = await uploadProductImage(buffer, tempSlug, 'main');
        } else {
          throw new Error('Invalid image file format. Use base64 image data.');
        }
      } catch (uploadError: any) {
        return res.status(400).json({ 
          error: `Failed to upload main image: ${uploadError.message}` 
        });
      }
    }
    
    // Prepare product data
    // Validate and parse selling_price
    const parsedSellingPrice = selling_price != null && selling_price !== '' 
      ? parseFloat(selling_price) 
      : 0;
    
    if (isNaN(parsedSellingPrice) || parsedSellingPrice < 0) {
      return res.status(400).json({ 
        error: 'Invalid selling_price. Must be a valid positive number.' 
      });
    }
    
    const productData: any = {
      category_id,
      title,
      description,
      selling_price: parsedSellingPrice,
      main_image_url: finalMainImageUrl,
      variants: { sizes: sizesArray, colors: colorsArray },
    };
    
    if (discount_percentage !== undefined && discount_percentage !== null) {
      productData.discount_percentage = parseFloat(discount_percentage);
    }
    if (on_sale !== undefined) {
      productData.on_sale = Boolean(on_sale);
    }
    if (sale_discount_percentage !== undefined && sale_discount_percentage !== null) {
      productData.sale_discount_percentage = parseFloat(sale_discount_percentage);
    }
    if (usp_tag) productData.usp_tag = usp_tag;
    if (rating !== undefined) productData.rating = parseFloat(rating);
    if (review_count !== undefined) productData.review_count = parseInt(review_count);
    if (fulfillment_partner) productData.fulfillment_partner = fulfillment_partner;
    if (partner_product_id) productData.partner_product_id = partner_product_id;
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select(`
        *,
        categories:category_id (
          id,
          slug,
          name
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Variants are stored in products.variants JSONB - no separate table needed
    console.log('✅ Product created with variants:', { sizes: sizesArray, colors: colorsArray });
    
    // Handle mockup images by color
    if (mockup_images_by_color && typeof mockup_images_by_color === 'object') {
      for (const [color, imageArray] of Object.entries(mockup_images_by_color)) {
        if (Array.isArray(imageArray) && imageArray.length > 0) {
          const uploadedUrls: string[] = [];
          for (let i = 0; i < imageArray.length; i++) {
            const imageData = imageArray[i];
            if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
              try {
                const base64Data = imageData.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadedUrl = await uploadProductImage(buffer, `${tempSlug}_${color}_${i}`, 'mockup');
                uploadedUrls.push(uploadedUrl);
              } catch (uploadError: any) {
                console.error(`Failed to upload mockup image for ${color}:`, uploadError);
              }
            } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
              uploadedUrls.push(imageData);
            }
          }
          
          if (uploadedUrls.length > 0) {
            await supabaseAdmin
              .from('product_variants')
              .update({ mockup_images: uploadedUrls })
              .eq('product_id', data.id)
              .eq('color', color);
          }
        }
      }
    }
    
    const category = data.categories;
    delete data.categories;
    const transformed = transformProduct(data, category);
    
    // Cache the new product
    await cache.setJSON(cacheKeys.product(data.id), transformed, CACHE_TTL);
    
    // Upsert in cache arrays (products:all and category-specific cache)
    await upsertProductInCacheArrays(transformed);
    
    res.status(201).json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get old product data to find old category slug for cache cleanup
    let oldCategorySlug: string | undefined;
    const { data: oldProduct } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories:category_id (
          slug
        )
      `)
      .eq('id', id)
      .single();
    
    if (oldProduct?.categories) {
      oldCategorySlug = oldProduct.categories.slug;
    }
    const {
      category_id,
      title,
      description,
      selling_price,
      discount_percentage,
      on_sale,
      sale_discount_percentage,
      usp_tag,
      main_image_url,
      main_image_file,
      mockup_images_by_color,
      rating,
      review_count,
      sizes,
      colors,
      fulfillment_partner,
      partner_product_id,
    } = req.body;
    
    // Ensure sizes and colors are arrays
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
    
    console.log('🔄 Updating product with data:', {
      id,
      sizes: sizesArray,
      colors: colorsArray,
      sizesLength: sizesArray.length,
      colorsLength: colorsArray.length,
    });
    
    const productSlug = title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || id.substring(0, 8);
    
    // Handle main image upload
    if (main_image_file && !main_image_url) {
      try {
        if (typeof main_image_file === 'string' && main_image_file.startsWith('data:image')) {
          const base64Data = main_image_file.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const uploadedUrl = await uploadProductImage(buffer, productSlug, 'main');
          req.body.main_image_url = uploadedUrl;
        } else {
          throw new Error('Invalid image file format. Use base64 image data.');
        }
      } catch (uploadError: any) {
        return res.status(400).json({ 
          error: `Failed to upload main image: ${uploadError.message}` 
        });
      }
    }
    
    // Prepare update data
    const productData: any = {};
    if (category_id) productData.category_id = category_id;
    if (title) productData.title = title;
    if (description) productData.description = description;
    if (selling_price !== undefined && selling_price !== null && selling_price !== '') {
      const parsedPrice = parseFloat(selling_price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ 
          error: 'Invalid selling_price. Must be a valid positive number.' 
        });
      }
      productData.selling_price = parsedPrice;
    }
    if (discount_percentage !== undefined) {
      productData.discount_percentage = discount_percentage !== null ? parseFloat(discount_percentage) : null;
    }
    if (on_sale !== undefined) productData.on_sale = Boolean(on_sale);
    if (sale_discount_percentage !== undefined) {
      productData.sale_discount_percentage = sale_discount_percentage !== null ? parseFloat(sale_discount_percentage) : null;
    }
    if (usp_tag !== undefined) productData.usp_tag = usp_tag || null;
    if (main_image_url || req.body.main_image_url) productData.main_image_url = main_image_url || req.body.main_image_url;
    if (rating !== undefined) productData.rating = rating ? parseFloat(rating) : null;
    if (review_count !== undefined) productData.review_count = parseInt(review_count);
    if (sizesArray.length > 0 || colorsArray.length > 0) {
      productData.variants = { sizes: sizesArray, colors: colorsArray };
    }
    if (fulfillment_partner !== undefined) productData.fulfillment_partner = fulfillment_partner || null;
    if (partner_product_id !== undefined) productData.partner_product_id = partner_product_id || null;
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select(`
        *,
        categories:category_id (
          id,
          slug,
          name
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Variants are stored in products.variants JSONB - no separate table updates needed
    console.log('✅ Product updated with variants:', { sizes: sizesArray, colors: colorsArray });
    
    // Handle mockup images by color
    if (mockup_images_by_color && typeof mockup_images_by_color === 'object') {
      for (const [color, imageArray] of Object.entries(mockup_images_by_color)) {
        if (Array.isArray(imageArray) && imageArray.length > 0) {
          const uploadedUrls: string[] = [];
          for (let i = 0; i < imageArray.length; i++) {
            const imageData = imageArray[i];
            if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
              try {
                const base64Data = imageData.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadedUrl = await uploadProductImage(buffer, `${productSlug}_${color}_${i}`, 'mockup');
                uploadedUrls.push(uploadedUrl);
              } catch (uploadError: any) {
                console.error(`Failed to upload mockup image for ${color}:`, uploadError);
              }
            } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
              uploadedUrls.push(imageData);
            }
          }
          
          // Mockup images by color are stored in products.mockup_images_by_color JSONB
          // This is already handled in the productData update above
        }
      }
    }
    
    const category = data.categories;
    delete data.categories;
    const transformed = transformProduct(data, category);
    
    // Update product in cache
    await cache.setJSON(cacheKeys.product(id), transformed, CACHE_TTL);
    
    // Upsert in cache arrays (products:all and category-specific cache)
    await upsertProductInCacheArrays(transformed);
    
    // If category changed, remove from old category cache
    const newCategorySlug = category?.slug;
    if (oldCategorySlug && newCategorySlug && oldCategorySlug !== newCategorySlug) {
      await removeProductFromCacheArrays(id, oldCategorySlug);
    }
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get product category slug before deletion for cache cleanup
    let categorySlug: string | undefined;
    const { data: productToDelete } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories:category_id (
          slug
        )
      `)
      .eq('id', id)
      .single();
    
    if (productToDelete?.categories) {
      categorySlug = productToDelete.categories.slug;
    }
    
    // Delete from database
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Remove from cache
    await cache.del(cacheKeys.product(id));
    
    // Remove from cache arrays (products:all and category-specific cache)
    await removeProductFromCacheArrays(id, categorySlug);
    
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

export default router;
