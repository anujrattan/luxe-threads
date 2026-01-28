import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../services/supabase.js";

const router = Router();

/**
 * GET /api/faqs
 * Public: list published FAQ items, grouped by category + sort_order.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("faq_items")
      .select("id, question, answer_markdown, category, sort_order")
      .eq("is_published", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

