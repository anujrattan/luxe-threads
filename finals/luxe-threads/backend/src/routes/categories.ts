/**
 * Category Routes
 */

import { Router } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';
import { uploadCategoryImage, extractFilePathFromUrl, deleteFile } from '../services/storage.js';

const router = Router();

// Helper function to transform database category to API format
const transformCategory = (dbCategory: any) => ({
  id: dbCategory.id,
  name: dbCategory.name,
  slug: dbCategory.slug,
  imageUrl: dbCategory.image_url || dbCategory.imageUrl,
  isActive: dbCategory.is_active !== undefined ? dbCategory.is_active : true,
});

// Get all categories (public) - only returns active categories
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    const transformed = data.map(transformCategory);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Get all categories including inactive ones (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    const transformed = data.map(transformCategory);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Get category by slug (public) - only returns if active
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    
    const transformed = transformCategory(data);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { name, slug, imageUrl, imageFile } = req.body;
    
    let finalImageUrl: string;
    
    // If imageFile is provided (base64 data URL), upload to Supabase Storage
    if (imageFile && !imageUrl) {
      if (typeof imageFile === 'string' && imageFile.startsWith('data:image')) {
        // Extract content type and base64 data
        const matches = imageFile.match(/^data:image\/([^;]+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ 
            error: 'Invalid image file format. Expected base64 image data.' 
          });
        }
        
        const contentType = `image/${matches[1]}`;
        const base64Data = matches[2];
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Upload to Supabase Storage
        finalImageUrl = await uploadCategoryImage(fileBuffer, slug, contentType);
      } else {
        return res.status(400).json({ 
          error: 'Invalid image file format. Please provide a valid image URL or base64 image data.' 
        });
      }
    } else if (imageUrl) {
      // Use provided URL directly
      finalImageUrl = imageUrl;
    } else {
      return res.status(400).json({ 
        error: 'Image URL or image file is required. Please provide either an image URL or upload an image file.' 
      });
    }
    
    const categoryData = {
      name,
      slug,
      image_url: finalImageUrl,
      is_active: true, // New categories are active by default
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    
    const transformed = transformCategory(data);
    
    res.status(201).json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, imageUrl, imageFile } = req.body;
    
    // Get existing category to check for old image
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('image_url, slug')
      .eq('id', id)
      .single();
    
    const categoryData: any = {};
    if (name) categoryData.name = name;
    if (slug) categoryData.slug = slug;
    
    // Handle image URL or file upload
    if (imageFile && !imageUrl) {
      if (typeof imageFile === 'string' && imageFile.startsWith('data:image')) {
        // Extract content type and base64 data
        const matches = imageFile.match(/^data:image\/([^;]+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ 
            error: 'Invalid image file format. Expected base64 image data.' 
          });
        }
        
        const contentType = `image/${matches[1]}`;
        const base64Data = matches[2];
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Upload new image to Supabase Storage
        const newImageUrl = await uploadCategoryImage(fileBuffer, slug || existingCategory?.slug || id, contentType);
        categoryData.image_url = newImageUrl;
        
        // Delete old image from storage if it exists and is from Supabase Storage
        if (existingCategory?.image_url) {
          const oldFilePath = extractFilePathFromUrl(existingCategory.image_url);
          if (oldFilePath) {
            try {
              await deleteFile(oldFilePath);
            } catch (deleteError) {
              // Log but don't fail the update if deletion fails
              console.warn('Failed to delete old image from storage:', deleteError);
            }
          }
        }
      }
    } else if (imageUrl) {
      categoryData.image_url = imageUrl;
      
      // Delete old image from storage if it exists and is from Supabase Storage
      // (only if the new URL is different)
      if (existingCategory?.image_url && existingCategory.image_url !== imageUrl) {
        const oldFilePath = extractFilePathFromUrl(existingCategory.image_url);
        if (oldFilePath) {
          try {
            await deleteFile(oldFilePath);
          } catch (deleteError) {
            // Log but don't fail the update if deletion fails
            console.warn('Failed to delete old image from storage:', deleteError);
          }
        }
      }
    }
    // If neither is provided, don't update the image
    
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const transformed = transformCategory(data);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Toggle category active status (admin only)
router.patch('/:id/toggle-active', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('is_active')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Toggle the status
    const newStatus = !category.is_active;
    
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: newStatus })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const transformed = transformCategory(data);
    
    res.json(transformed);
  } catch (error: any) {
    next(error);
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Get category image URL before deleting
    const { data: category } = await supabase
      .from('categories')
      .select('image_url')
      .eq('id', id)
      .single();
    
    // Delete from database
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Delete image from storage if it exists and is from Supabase Storage
    if (category?.image_url) {
      const filePath = extractFilePathFromUrl(category.image_url);
      if (filePath) {
        try {
          await deleteFile(filePath);
        } catch (deleteError) {
          // Log but don't fail the delete if image deletion fails
          console.warn('Failed to delete category image from storage:', deleteError);
        }
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

export default router;

