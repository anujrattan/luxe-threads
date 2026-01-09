/**
 * Orders API Routes
 * 
 * Handles order creation and management
 */

import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../services/supabase.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { cache } from "../services/redis.js";

const router = Router();

/**
 * Middleware to authenticate and extract user info from JWT token
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        role: string;
      };

      (req as any).userId = decoded.userId;
      (req as any).userRole = decoded.role;
      (req as any).userEmail = decoded.email;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error: any) {
    next(error);
  }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;
  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

/**
 * GET /api/orders
 * Get all orders (for admin panel)
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          address1,
          address2,
          city,
          province,
          zip,
          country_code
        )
      `)
      .order("created_at", { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      throw ordersError;
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order: any) => {
        const { data: orderItems } = await supabaseAdmin
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        // Extract user object from users array (Supabase returns as array)
        const user = Array.isArray(order.users) ? order.users[0] : order.users;

        return {
          ...order,
          users: user || null,
          items: orderItems || [],
        };
      })
    );

    res.json({
      success: true,
      orders: ordersWithItems,
      total: ordersWithItems.length,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    next(error);
  }
});

/**
 * Request body interface for order creation
 */
interface CreateOrderRequest {
  userId?: string; // Optional - auth user ID if logged in
  userEmail: string;
  userName: string;
  lineItems: Array<{
    variantId?: string; // Optional - can look up by productId + size + color
    productId: string; // Required if variantId not provided
    size?: string; // Required if variantId not provided
    color?: string; // Required if variantId not provided
    quantity: number;
    price: number; // Unit price
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    countryCode?: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  gateway: "COD" | "Prepaid"; // Payment gateway
}

/**
 * POST /api/orders
 * Create a new order
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    console.log(`[ORDER] [${new Date().toISOString()}] Step 1: Initiate order creation`);
    console.log(`[ORDER] [${new Date().toISOString()}] Request received:`, {
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      gateway: req.body.gateway,
      lineItemsCount: req.body.lineItems?.length || 0,
      totalAmount: req.body.totalAmount,
    });

    const orderData: CreateOrderRequest = req.body;

    // Validate required fields
    console.log(`[ORDER] [${new Date().toISOString()}] Step 2: Validating request fields`);
    if (
      !orderData.userEmail ||
      !orderData.userName ||
      !orderData.lineItems ||
      orderData.lineItems.length === 0 ||
      !orderData.shippingAddress ||
      !orderData.totalAmount
    ) {
      console.error(`[ORDER] [${new Date().toISOString()}] ❌ Validation failed: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate gateway
    if (orderData.gateway !== "COD" && orderData.gateway !== "Prepaid") {
      console.error(`[ORDER] [${new Date().toISOString()}] ❌ Invalid gateway: ${orderData.gateway}`);
      return res.status(400).json({
        success: false,
        message: "Gateway must be 'COD' or 'Prepaid'",
      });
    }
    console.log(`[ORDER] [${new Date().toISOString()}] ✅ Validation passed`);
    console.log(`[ORDER] [${new Date().toISOString()}] Payment gateway: ${orderData.gateway}`);

    // Generate order number
    console.log(`[ORDER] [${new Date().toISOString()}] Step 3: Generating order number`);
    const orderNumber = await generateOrderNumber();
    console.log(`[ORDER] [${new Date().toISOString()}] ✅ Generated order number: ${orderNumber}`);

    // Step 1: Find or create user in users table (upsert - update only missing fields)
    let userId: string | null = null;
    let existingUser: any = null;
    
    if (orderData.userId) {
      // User is authenticated - try to find existing user by auth_user_id
      const { data: userByAuthId } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("auth_user_id", orderData.userId)
        .single();
      
      if (userByAuthId) {
        existingUser = userByAuthId;
        userId = userByAuthId.id;
        console.log(`👤 Found existing user by auth_user_id: ${userId}`);
      }
    }
    
    // If not found, try to find by email
    if (!userId) {
      const { data: userByEmail } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", orderData.userEmail)
        .single();
      
      if (userByEmail) {
        existingUser = userByEmail;
        userId = userByEmail.id;
        console.log(`👤 Found existing user by email: ${userId}`);
      }
    }
    
    if (existingUser && userId) {
      // Update only missing/null fields (Option A: update only missing details)
      const updateData: any = {};
      
      if (!existingUser.phone && orderData.shippingAddress.phone) {
        updateData.phone = orderData.shippingAddress.phone;
      }
      if (!existingUser.first_name && orderData.shippingAddress.firstName) {
        updateData.first_name = orderData.shippingAddress.firstName;
      }
      if (!existingUser.last_name && orderData.shippingAddress.lastName) {
        updateData.last_name = orderData.shippingAddress.lastName || "";
      }
      if (!existingUser.address1 && orderData.shippingAddress.address1) {
        updateData.address1 = orderData.shippingAddress.address1;
      }
      if (!existingUser.address2 && orderData.shippingAddress.address2) {
        updateData.address2 = orderData.shippingAddress.address2;
      }
      if (!existingUser.city && orderData.shippingAddress.city) {
        updateData.city = orderData.shippingAddress.city;
      }
      if (!existingUser.province && orderData.shippingAddress.province) {
        updateData.province = orderData.shippingAddress.province;
      }
      if (!existingUser.zip && orderData.shippingAddress.zip) {
        updateData.zip = orderData.shippingAddress.zip;
      }
      if (!existingUser.country_code && orderData.shippingAddress.countryCode) {
        updateData.country_code = orderData.shippingAddress.countryCode;
      }
      // Link auth_user_id if user is authenticated and it's not set
      if (orderData.userId && !existingUser.auth_user_id) {
        updateData.auth_user_id = orderData.userId;
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update(updateData)
          .eq("id", userId);
        
        if (updateError) {
          console.error("Error updating user:", updateError);
          // Continue anyway - don't fail order creation
        } else {
          console.log(`👤 Updated user ${userId} with missing fields:`, Object.keys(updateData));
        }
      }
    } else {
      // Create new user record
      const { data: newUser, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          auth_user_id: orderData.userId || null,
          first_name: orderData.shippingAddress.firstName,
          last_name: orderData.shippingAddress.lastName || "",
          email: orderData.shippingAddress.email,
          phone: orderData.shippingAddress.phone || null,
          address1: orderData.shippingAddress.address1,
          address2: orderData.shippingAddress.address2 || null,
          city: orderData.shippingAddress.city,
          province: orderData.shippingAddress.province || null,
          zip: orderData.shippingAddress.zip,
          country_code: orderData.shippingAddress.countryCode || "IN",
          type: "shipping",
        })
        .select("id")
        .single();
      
      if (userError || !newUser) {
        console.error("Error creating user:", userError);
        throw new Error("Failed to create user record");
      }
      
      userId = newUser.id;
      console.log(`👤 Created new user: ${userId}`);
    }

    // Step 2: Validate line items and fetch product details
    if (!orderData.lineItems || orderData.lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one line item is required",
      });
    }

    // Validate each line item has required fields
    for (const item of orderData.lineItems) {
      if (!item.productId || !item.size || !item.color) {
        return res.status(400).json({
          success: false,
          message: "Each line item must have productId, size, and color",
        });
      }
    }

    // Fetch product details for order items
    const productIds = [...new Set(orderData.lineItems.map((item) => item.productId))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      // Include fulfillment_partner so we can auto-wire it onto the order
      .select("id, title, variants, fulfillment_partner")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw new Error("Failed to fetch products");
    }
    
    const productMap = new Map(products?.map((p) => [p.id, p.title]) || []);
    
    // Validate that sizes and colors exist in product variants,
    // and collect fulfillment partners used in this order
    const fulfillmentPartners = new Set<string>();

    for (const item of orderData.lineItems) {
      const product = products?.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      
      const variants = product.variants || { sizes: [], colors: [] };
      const availableSizes = variants.sizes || [];
      const availableColors = variants.colors || [];
      
      if (!availableSizes.includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} is not available for product ${product.title}. Available sizes: ${availableSizes.join(', ')}`,
        });
      }
      
      if (!availableColors.includes(item.color)) {
        return res.status(400).json({
          success: false,
          message: `Color ${item.color} is not available for product ${product.title}. Available colors: ${availableColors.join(', ')}`,
        });
      }

      // Track fulfillment partner for this product, if any
      if (product.fulfillment_partner) {
        fulfillmentPartners.add(product.fulfillment_partner);
      }
    }

    // Decide auto-wired fulfillment partner for the order:
    // - If all items share the same non-null partner, auto-set that on the order
    // - If there are multiple partners or none, leave null so admin can choose manually
    let orderFulfillmentPartner: string | null = null;
    if (fulfillmentPartners.size === 1) {
      orderFulfillmentPartner = Array.from(fulfillmentPartners)[0];
      console.log(
        `[ORDER] [${new Date().toISOString()}] Auto-wired fulfillment partner for order ${orderNumber}:`,
        orderFulfillmentPartner
      );
    } else if (fulfillmentPartners.size > 1) {
      console.log(
        `[ORDER] [${new Date().toISOString()}] Multiple fulfillment partners detected in order ${orderNumber}; leaving order.fulfillment_partner null for manual selection`
      );
    }

    // Step 3.5: Derive tax and subtotal from total amount for reporting/analytics
    // Prices are stored as tax-inclusive at the line item level.
    // GST slab is applied PER ITEM (unit price), not on the overall order total:
    // - Up to ₹2,500 (inclusive) per item → 5% GST
    // - Above ₹2,500 per item → 18% GST
    //
    // We reverse-calculate GST per line item, then sum across the order.
    let itemsTotal = 0;
    let totalNetAmount = 0;
    let totalTaxAmount = 0;

    const determineGstRateForUnit = (unitPrice: number) => {
      if (unitPrice <= 2500) {
        return 0.05;
      }
      return 0.18;
    };

    for (const item of orderData.lineItems) {
      const lineTotal = item.price * item.quantity; // tax-inclusive line total
      itemsTotal += lineTotal;

      const gstRate = determineGstRateForUnit(item.price);
      const lineNet = lineTotal / (1 + gstRate);
      const lineTax = lineTotal - lineNet;

      totalNetAmount += lineNet;
      totalTaxAmount += lineTax;
    }

    // Step 4: Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId, // Reference to users table
        user_email: orderData.userEmail,
        user_name: orderData.userName,
        status: "pending",
        // Store derived values for admin/accounting; customer sees only tax-inclusive total.
        subtotal: Math.round(totalNetAmount),
        tax_amount: Math.round(totalTaxAmount),
        shipping_cost: orderData.shippingCost,
        total_amount: itemsTotal + orderData.shippingCost,
        payment_status: "pending", // Always start as pending, will be updated after payment verification
        gateway: orderData.gateway,
        // Auto-wired fulfillment partner based on products in the order (may be null)
        fulfillment_partner: orderFulfillmentPartner,
      })
      .select()
      .single();

    if (orderError) {
      console.error(`[ORDER] [${new Date().toISOString()}] ❌ Error creating order:`, orderError);
      throw new Error("Failed to create order in database");
    }

    console.log(`[ORDER] [${new Date().toISOString()}] ✅ Order created in database:`, {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      gateway: order.gateway,
      total_amount: order.total_amount,
    });

    // Step 3: Create order items in database
    console.log(`[ORDER] [${new Date().toISOString()}] Step 6: Creating order items (Count: ${orderData.lineItems.length})`);
    const orderItemsData = orderData.lineItems.map((item) => {
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: productMap.get(item.productId) || "Unknown Product",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      };
    });

    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsData);

    if (orderItemsError) {
      console.error(`[ORDER] [${new Date().toISOString()}] ❌ Error creating order items:`, orderItemsError);
      // Try to clean up the order
      console.log(`[ORDER] [${new Date().toISOString()}] Attempting to cleanup order: ${order.id}`);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Failed to create order items");
    }

    console.log(`[ORDER] [${new Date().toISOString()}] ✅ Order items created successfully`);

    // Invalidate best-sellers cache so it refreshes with new order data
    console.log(`[ORDER] [${new Date().toISOString()}] Invalidating best-sellers cache`);
    try {
      await cache.del('orders:last30days');
      console.log(`[ORDER] [${new Date().toISOString()}] ✅ Cache invalidated successfully`);
    } catch (cacheError) {
      console.error(`[ORDER] [${new Date().toISOString()}] ⚠️  Cache invalidation failed:`, cacheError);
      // Don't fail the order if cache invalidation fails
    }

    const responseData: any = {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        shipping_cost: order.shipping_cost,
        payment_status: order.payment_status,
        gateway: order.gateway,
        created_at: order.created_at,
      },
      message: orderData.gateway === "COD" 
        ? "Order created successfully. Payment pending (COD)."
        : "Order created successfully. Please complete payment.",
      items_count: orderItemsData.length,
    };

    const duration = Date.now() - startTime;
    console.log(`[ORDER] [${new Date().toISOString()}] ✅ Step 7: Order creation complete (Duration: ${duration}ms)`);
    console.log(`[ORDER] [${new Date().toISOString()}] Order Summary:`, {
      order_number: order.order_number,
      total_items: orderItemsData.length,
      total_amount: order.total_amount,
      payment_gateway: order.gateway,
      payment_status: order.payment_status,
    });
    console.log(`[ORDER] [${new Date().toISOString()}] Success response:`, JSON.stringify(responseData, null, 2));

    // If Prepaid, the frontend will need to call /api/payments/create-order separately
    // We don't create the Razorpay order here to keep separation of concerns

    return res.status(201).json(responseData);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[ORDER] [${new Date().toISOString()}] ❌ Error creating order (Duration: ${duration}ms):`, error);
    console.error(`[ORDER] [${new Date().toISOString()}] Error stack:`, error.stack);
    next(error);
  }
});

/**
 * GET /api/orders/:orderNumber
 * Get order details by order number (supports logged in users and guest lookup with email query param)
 */
router.get(
  "/:orderNumber",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderNumber } = req.params;
      const { email } = req.query; // Optional email for guest lookup

      // Try to authenticate (optional for guest lookup)
      let userId: string | null = null;
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        try {
          const jwt = (await import("jsonwebtoken")).default;
          const { config } = await import("../config/index.js");
          const decoded = jwt.verify(token, config.jwt.secret) as {
            userId: string;
            email: string;
            role: string;
          };
          userId = decoded.userId;
        } catch {
          // Invalid token, continue as guest
        }
      }

      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Authorization check
      let hasAccess = false;

      if (userId) {
        // Logged in user - check if order belongs to them
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("auth_user_id", userId)
          .single();

        if (user && order.user_id === user.id) {
          hasAccess = true;
        }
      }

      if (!hasAccess && email) {
        // Guest lookup - verify email matches order
        if (order.user_email.toLowerCase() === (email as string).toLowerCase()) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Please provide email query parameter for guest orders or log in.",
        });
      }

      // Get order items
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (itemsError) {
        throw itemsError;
      }

      // Get payment details if exists
      let payment = null;
      if (order.payment_id) {
        const { data: paymentData } = await supabaseAdmin
          .from("payments")
          .select("*")
          .eq("id", order.payment_id)
          .single();

        payment = paymentData;
      }

      // Get user details
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", order.user_id)
        .single();

      return res.json({
        success: true,
        order: {
          ...order,
          items: orderItems || [],
          payment,
          user: user || null,
        },
      });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      next(error);
    }
  }
);

/**
 * POST /api/orders/lookup
 * Guest order lookup by order number and email
 */
router.post("/lookup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({
        success: false,
        message: "Order number and email are required",
      });
    }

    // Get order by order number
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify email matches
    if (order.user_email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Email does not match this order",
      });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      throw itemsError;
    }

    // Get payment details if exists
    let payment = null;
    if (order.payment_id) {
      const { data: paymentData } = await supabaseAdmin
        .from("payments")
        .select("*")
        .eq("id", order.payment_id)
        .single();

      payment = paymentData;
    }

    // Get user details
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", order.user_id)
      .single();

    res.json({
      success: true,
      order: {
        ...order,
        items: orderItems || [],
        payment,
        user: userData || null,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/orders/:orderNumber/status
 * Update order status (admin only)
 */
router.put("/:orderNumber/status", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    const { status, notes } = req.body;
    const userId = (req as any).userId;
    const userEmail = (req as any).userEmail;

    // Validate status
    const validStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status")
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Don't update if status is the same
    if (order.status === status) {
      return res.status(400).json({
        success: false,
        message: "Order already has this status",
      });
    }

    const oldStatus = order.status;

    // Get user name for audit log
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("name")
      .eq("id", userId)
      .single();

    const changedByName = profile?.name || userEmail?.split("@")[0] || "Admin";

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }

    // Create status history entry
    const { error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .insert({
        order_id: order.id,
        old_status: oldStatus,
        new_status: status,
        changed_by: userId,
        changed_by_name: changedByName,
        notes: notes || null,
      });

    if (historyError) {
      console.error("Error creating status history:", historyError);
      // Don't fail the request if history logging fails, but log it
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        status,
      },
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    next(error);
  }
});

/**
 * PUT /api/orders/:orderNumber/fulfillment-partner
 * Update order fulfillment partner (admin only)
 */
router.put("/:orderNumber/fulfillment-partner", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    const { fulfillment_partner } = req.body;

    // Validate fulfillment_partner (allow null or valid values)
    if (fulfillment_partner !== null && fulfillment_partner !== undefined) {
      const validPartners = ['Qikink', 'Printrove'];
      if (!validPartners.includes(fulfillment_partner)) {
        return res.status(400).json({
          success: false,
          message: `Invalid fulfillment partner. Must be one of: ${validPartners.join(', ')}, or null`,
        });
      }
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, fulfillment_partner")
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update fulfillment partner
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ fulfillment_partner: fulfillment_partner || null })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating fulfillment partner:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update fulfillment partner",
      });
    }

    res.json({
      success: true,
      message: "Fulfillment partner updated successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        fulfillment_partner: fulfillment_partner || null,
      },
    });
  } catch (error: any) {
    console.error("Error updating fulfillment partner:", error);
    next(error);
  }
});

/**
 * PUT /api/orders/:orderNumber/partner-order-id
 * Update order partner order ID (admin only)
 */
router.put("/:orderNumber/partner-order-id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    const { partner_order_id } = req.body;

    // Validate partner_order_id (allow null or non-empty string)
    if (partner_order_id !== null && partner_order_id !== undefined && partner_order_id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Partner order ID cannot be empty. Use null to clear it.",
      });
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, fulfillment_partner")
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update partner order ID
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ partner_order_id: partner_order_id ? partner_order_id.trim() : null })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating partner order ID:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update partner order ID",
      });
    }

    res.json({
      success: true,
      message: "Partner order ID updated successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        partner_order_id: partner_order_id ? partner_order_id.trim() : null,
      },
    });
  } catch (error: any) {
    console.error("Error updating partner order ID:", error);
    next(error);
  }
});

export default router;
