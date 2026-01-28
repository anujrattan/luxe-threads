import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../services/supabase.js";

const router = Router();

/**
 * GET /api/blog
 * Public: list published blog posts (for SEO + marketing pages)
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, cover_image, published_at, seo_title, seo_description"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      posts: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blog/:slug
 * Public: get a single published blog post by slug
 */
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    return res.json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

