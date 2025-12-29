# Mockup Images Strategy for Gelato Color Variants

## Problem Statement

When creating a product from a Gelato template, we receive multiple color variants (e.g., White, Black, Navy). Each color variant needs its own mockup images to show customers what the product looks like in that specific color.

## Current Structure

- **Products Table**: Has `mockup_images` JSONB array (generic mockups for the product)
- **Product Variants Table**: Stores Gelato variant data with `size` and `color` columns

## Proposed Solution

### Option 1: Store Mockup Images in `product_variants` Table (Recommended)

**Structure:**
- Add `mockup_images` JSONB column to `product_variants` table
- Each variant (color) has its own array of mockup image URLs
- Query: `SELECT mockup_images FROM product_variants WHERE product_id = X AND color = 'White'`

**Pros:**
- Direct mapping: color → mockup images
- Easy to query by color
- Scales well with multiple colors
- Keeps variant-specific data together

**Cons:**
- Requires joining with product_variants to get mockups
- Need to handle cases where color doesn't have mockups

### Option 2: Store in Products Table with Color Mapping

**Structure:**
- Change `mockup_images` to JSONB object: `{"White": ["url1", "url2"], "Black": ["url3", "url4"]}`
- Query: `SELECT mockup_images->'White' FROM products WHERE id = X`

**Pros:**
- All mockups in one place
- No join needed

**Cons:**
- Less normalized
- Harder to query by color
- Mixing product-level and variant-level data

## Recommended Implementation: Option 1

### Database Schema

```sql
-- Already implemented in migration 012
product_variants.mockup_images JSONB DEFAULT '[]'::jsonb
```

### Data Flow

1. **Admin Uploads Mockup Images:**
   - Admin selects a color variant
   - Uploads mockup images for that color
   - Images stored in `product_variants.mockup_images` for that specific variant

2. **Display Logic:**
   - When showing product details, get mockup images based on selected color
   - Query: `SELECT mockup_images FROM product_variants WHERE product_id = ? AND color = ?`

3. **Fallback:**
   - If variant doesn't have mockup images, use product-level `mockup_images`
   - Or use first available color's mockups

### API Changes Needed

1. **Update Variant Storage:**
   - When storing variants from Gelato template, initialize `mockup_images` as empty array
   - Admin can later upload images per color

2. **New Endpoint (Optional):**
   - `PUT /api/products/:id/variants/:variantId/mockups` - Upload mockups for specific variant

3. **Product Response:**
   - Include variant mockup images in product API response
   - Structure: `variants: [{ color: 'White', mockupImages: [...] }, ...]`

### Frontend Changes

1. **Admin Form:**
   - Add section to upload mockup images per color
   - Show color selector → upload mockups for selected color
   - Display existing mockups per color

2. **Product Display:**
   - Show mockup images based on selected color
   - Switch mockups when color changes

## Implementation Steps

1. ✅ Add `mockup_images` column to `product_variants` table (Migration 012)
2. Update variant storage to initialize empty mockup_images array
3. Update product API to include variant mockup images
4. Add admin UI to upload mockups per color
5. Update frontend product display to show color-specific mockups

## Questions to Consider

1. **Gelato API:** Does Gelato provide mockup images per variant?
   - If yes, we can auto-populate from Gelato
   - If no, admin needs to upload manually

2. **Default Behavior:** What if a color doesn't have mockups?
   - Use product-level mockups?
   - Use first available color's mockups?
   - Show placeholder?

3. **Bulk Upload:** Can admin upload same mockups for multiple colors?
   - Add "Apply to all colors" option?

