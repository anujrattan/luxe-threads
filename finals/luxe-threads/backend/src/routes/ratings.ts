import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../services/supabase.js";
import { cache } from "../services/redis.js";

const router = Router();

/**
 * Helper: Get cache key for product ratings
 */
function getRatingsCacheKey(productId: string): string {
  return `ratings:product:${productId}`;
}

/**
 * Helper: Invalidate ratings cache for a product
 */
async function invalidateRatingsCache(productId: string): Promise<void> {
  const cacheKey = getRatingsCacheKey(productId);
  await cache.del(cacheKey);
}

/**
 * POST /api/ratings
 * Submit or update a rating for a product
 */
router.post("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const { product_id, order_id, rating } = req.body;

    // Validate input
    if (!product_id || !order_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "product_id, order_id, and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Get user record
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authReq.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify order belongs to user and contains the product
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        user_id,
        status,
        order_items!inner(product_id)
      `)
      .eq("id", order_id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to you",
      });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "You can only rate products from delivered orders",
      });
    }

    // Check if product is in the order
    const orderItems = order.order_items as any[];
    const productInOrder = orderItems.some((item: any) => item.product_id === product_id);

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: "This product is not in the specified order",
      });
    }

    // Check if rating already exists (upsert)
    const { data: existingRating } = await supabaseAdmin
      .from("product_ratings")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .eq("order_id", order_id)
      .single();

    let ratingData;

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabaseAdmin
        .from("product_ratings")
        .update({ rating })
        .eq("id", existingRating.id)
        .select()
        .single();

      if (error) throw error;
      ratingData = data;
    } else {
      // Insert new rating
      const { data, error } = await supabaseAdmin
        .from("product_ratings")
        .insert({
          user_id: user.id,
          product_id,
          order_id,
          rating,
        })
        .select()
        .single();

      if (error) throw error;
      ratingData = data;
    }

    // Invalidate cache
    await invalidateRatingsCache(product_id);

    res.status(existingRating ? 200 : 201).json({
      success: true,
      message: existingRating ? "Rating updated successfully" : "Rating submitted successfully",
      rating: ratingData,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/ratings/product/:productId
 * Get rating breakdown for a product
 */
router.get("/product/:productId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    // Try cache first
    const cacheKey = getRatingsCacheKey(productId);
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Get product rating info
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("rating, rating_count")
      .eq("id", productId)
      .single();

    if (productError) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get rating breakdown
    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from("product_ratings")
      .select("rating")
      .eq("product_id", productId);

    if (ratingsError) throw ratingsError;

    // Calculate breakdown
    const breakdown: { [key: string]: number } = {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0,
    };

    ratings?.forEach((r: any) => {
      breakdown[r.rating.toString()]++;
    });

    const response = {
      success: true,
      averageRating: parseFloat(product.rating) || 0,
      totalRatings: product.rating_count || 0,
      breakdown,
    };

    // Cache the result (no expiry)
    await cache.set(cacheKey, JSON.stringify(response));

    res.json(response);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/ratings/order/:orderNumber
 * Get user's ratings for products in an order
 */
router.get("/order/:orderNumber", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const { orderNumber } = req.params;

    // Get user record
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authReq.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get ratings for this order
    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from("product_ratings")
      .select("*")
      .eq("order_id", order.id)
      .eq("user_id", user.id);

    if (ratingsError) throw ratingsError;

    res.json({
      success: true,
      ratings: ratings || [],
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/ratings/can-rate/:productId/:orderNumber
 * Check if user can rate a specific product from an order
 */
router.get("/can-rate/:productId/:orderNumber", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const { productId, orderNumber } = req.params;

    // Get user record
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authReq.userId)
      .single();

    if (userError || !user) {
      return res.json({
        success: true,
        canRate: false,
        reason: "User not found",
      });
    }

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        order_items!inner(product_id)
      `)
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return res.json({
        success: true,
        canRate: false,
        reason: "Order not found",
      });
    }

    // Check if delivered
    if (order.status !== "delivered") {
      return res.json({
        success: true,
        canRate: false,
        reason: "Order not yet delivered",
      });
    }

    // Check if product in order
    const orderItems = order.order_items as any[];
    const productInOrder = orderItems.some((item: any) => item.product_id === productId);

    if (!productInOrder) {
      return res.json({
        success: true,
        canRate: false,
        reason: "Product not in order",
      });
    }

    // Check if already rated
    const { data: existingRating } = await supabaseAdmin
      .from("product_ratings")
      .select("rating")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("order_id", order.id)
      .single();

    res.json({
      success: true,
      canRate: true,
      existingRating: existingRating?.rating || null,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
