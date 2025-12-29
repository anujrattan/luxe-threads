# Gelato Integration Testing Guide

## Overview

This document provides comprehensive test cases to verify the Gelato integration at each level. Test each step sequentially to ensure no gaps in the integration.

## Prerequisites

1. **Environment Variables Set:**
   ```env
   GELATO_API_KEY=your-api-key
   GELATO_STORE_ID=your-store-id
   GELATO_ECOMMERCE_API_BASE_URL=https://ecommerce.gelatoapis.com/v1
   ```

2. **Database Migrations Run:**
   - `010_add_gelato_template_data.sql` - Adds template data fields

3. **Test Template ID:**
   - Have a valid Gelato template ID ready (from Gelato dashboard)

---

## Test Cases

### Test Case 1: Template ID Storage (Basic)

**Objective:** Verify template ID is saved to database

**Steps:**
1. Open Admin Console → Products
2. Create or edit a product
3. Enter a Gelato Template ID (e.g., `5f55678c-efd6-4c2e-bf6c-d639b909e449`)
4. Click "Save Product"

**Expected Results:**
- ✅ Product saves successfully
- ✅ `gelato_template_id` field in `products` table contains the template ID
- ✅ No errors in server console

**Verification Query:**
```sql
SELECT id, title, gelato_template_id 
FROM products 
WHERE gelato_template_id IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 1;
```

---

### Test Case 2: Template Fetch (API Call)

**Objective:** Verify template is fetched from Gelato API

**Steps:**
1. Complete Test Case 1
2. Check server console logs

**Expected Results:**
- ✅ Log shows: `[Gelato Get Template] Request URL: https://ecommerce.gelatoapis.com/v1/templates/{templateId}`
- ✅ Log shows: `[Gelato Get Template] Response Status: 200`
- ✅ Log shows full template response with variants array
- ✅ No API errors

**Verification:**
- Check server console for:
  ```
  [Gelato Get Template] ✅ Success Response:
  [Gelato Get Template] Response Body: { ... }
  ```

---

### Test Case 3: Template Metadata Storage

**Objective:** Verify template metadata is stored in database

**Steps:**
1. Complete Test Case 2
2. Query database for template data

**Expected Results:**
- ✅ `gelato_template_data` JSONB field contains:
  - `templateName`
  - `title`
  - `description`
  - `productType`
  - `vendor`
  - `imagePlaceholders`
  - `textPlaceholders`
  - `createdAt`
  - `updatedAt`
- ✅ `gelato_preview_url` contains preview image URL

**Verification Query:**
```sql
SELECT 
  id,
  title,
  gelato_template_id,
  gelato_preview_url,
  gelato_template_data->>'templateName' as template_name,
  gelato_template_data->>'productType' as product_type,
  gelato_template_data->'imagePlaceholders' as image_placeholders
FROM products 
WHERE gelato_template_id IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 1;
```

---

### Test Case 4: Variant Extraction

**Objective:** Verify sizes and colors are extracted from variants

**Steps:**
1. Complete Test Case 3
2. Check server console logs for extracted sizes/colors

**Expected Results:**
- ✅ Log shows: `[Product Create/Update] Extracted sizes: ['S', 'M', 'L', 'XL', ...]`
- ✅ Log shows: `[Product Create/Update] Extracted colors: ['White', ...]`
- ✅ Sizes extracted from `variantOptions` where `name: "Size"`
- ✅ Colors extracted from `variantOptions` where `name: "Color"`

**Verification:**
- Check server console for extraction logs
- Verify sizes/colors match template response

---

### Test Case 5: Variants Field Update

**Objective:** Verify `products.variants` field is updated with extracted sizes/colors

**Steps:**
1. Complete Test Case 4
2. Query database for variants field

**Expected Results:**
- ✅ `products.variants` JSONB field contains:
  ```json
  {
    "sizes": ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    "colors": ["White"]
  }
  ```
- ✅ Sizes array is sorted
- ✅ Colors array is sorted

**Verification Query:**
```sql
SELECT 
  id,
  title,
  variants->'sizes' as sizes,
  variants->'colors' as colors
FROM products 
WHERE gelato_template_id IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 1;
```

---

### Test Case 6: Product Variants Table Storage

**Objective:** Verify each variant is stored in `product_variants` table

**Steps:**
1. Complete Test Case 5
2. Query `product_variants` table

**Expected Results:**
- ✅ One row per variant in template response
- ✅ Each row contains:
  - `product_id` = local product UUID
  - `gelato_variant_id` = variant.id from template
  - `gelato_product_id` = variant.productUid from template
  - `variant_data` JSONB contains:
    - `title`
    - `productUid`
    - `variantOptions`
    - `imagePlaceholders`
    - `textPlaceholders`
    - `size` (extracted)
    - `color` (extracted)

**Verification Query:**
```sql
SELECT 
  pv.id,
  pv.product_id,
  pv.gelato_variant_id,
  pv.gelato_product_id,
  pv.variant_data->>'title' as variant_title,
  pv.variant_data->>'size' as size,
  pv.variant_data->>'color' as color,
  pv.variant_data->'variantOptions' as variant_options,
  p.title as product_title
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.gelato_template_id IS NOT NULL
ORDER BY p.updated_at DESC, pv.created_at;
```

**Expected Count:**
- Should match number of variants in template response (e.g., 8 variants = 8 rows)

---

### Test Case 7: Variant Upsert (Update Existing)

**Objective:** Verify variants are updated, not duplicated, on product update

**Steps:**
1. Complete Test Case 6
2. Edit the same product again
3. Save product (same template ID)
4. Query `product_variants` table again

**Expected Results:**
- ✅ Same number of rows (no duplicates)
- ✅ `updated_at` timestamp is updated
- ✅ Variant data is refreshed with latest from Gelato

**Verification Query:**
```sql
-- Count variants per product
SELECT 
  p.id,
  p.title,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.gelato_template_id IS NOT NULL
GROUP BY p.id, p.title
ORDER BY p.updated_at DESC;
```

---

### Test Case 8: Error Handling

**Objective:** Verify graceful error handling

**Test 8a: Invalid Template ID**
- Enter invalid template ID (e.g., `invalid-template-id`)
- Save product
- **Expected:** Product saves, but template fetch fails gracefully (logged, not thrown)

**Test 8b: Missing API Key**
- Temporarily remove `GELATO_API_KEY` from .env
- Save product with template ID
- **Expected:** Error logged, product still saves

**Test 8c: Network Error**
- Disconnect internet
- Save product with template ID
- **Expected:** Error logged, product still saves

---

### Test Case 9: Multiple Products with Same Template

**Objective:** Verify multiple products can use same template

**Steps:**
1. Create Product A with template ID `template-123`
2. Create Product B with same template ID `template-123`
3. Query both products

**Expected Results:**
- ✅ Both products have same `gelato_template_id`
- ✅ Both products have same `gelato_template_data`
- ✅ Each product has its own variants in `product_variants` table
- ✅ Variants are linked to correct `product_id`

**Verification Query:**
```sql
SELECT 
  p.id,
  p.title,
  p.gelato_template_id,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.gelato_template_id = 'your-template-id'
GROUP BY p.id, p.title, p.gelato_template_id;
```

---

### Test Case 10: Template Update (Change Template ID)

**Objective:** Verify changing template ID updates all related data

**Steps:**
1. Product has template ID `template-123`
2. Edit product, change to template ID `template-456`
3. Save product

**Expected Results:**
- ✅ `gelato_template_id` updated to `template-456`
- ✅ `gelato_template_data` updated with new template data
- ✅ `gelato_preview_url` updated
- ✅ Old variants removed/replaced with new variants
- ✅ `products.variants` updated with new sizes/colors

**Verification:**
- Query product before and after update
- Verify all Gelato fields are updated

---

## Integration Checklist

Use this checklist to verify complete integration:

- [ ] Template ID saves to database
- [ ] Template fetched from Gelato API
- [ ] Template metadata stored in `gelato_template_data`
- [ ] Preview URL stored in `gelato_preview_url`
- [ ] Sizes extracted from variants
- [ ] Colors extracted from variants
- [ ] `products.variants` field updated
- [ ] Variants stored in `product_variants` table
- [ ] Each variant has correct `gelato_variant_id`
- [ ] Each variant has correct `gelato_product_id`
- [ ] Variant data includes size and color
- [ ] Variants linked to correct product
- [ ] Error handling works gracefully
- [ ] Multiple products can use same template
- [ ] Template ID can be changed/updated

---

## Debugging Tips

### Check Server Logs
Look for these log patterns:
- `[Product Create/Update]` - Product save operations
- `[Gelato Get Template]` - Template API calls
- `[Store Variants]` - Variant storage operations

### Common Issues

1. **Variants not storing:**
   - Check `product_variants` table exists
   - Verify `product_id` is valid UUID
   - Check for constraint violations

2. **Sizes/colors not extracted:**
   - Verify template response has `variantOptions`
   - Check variant structure matches expected format
   - Review extraction logic logs

3. **Template data not saving:**
   - Verify `gelato_template_data` column exists
   - Check JSONB format is valid
   - Review update query logs

---

## SQL Queries for Verification

### Get All Products with Gelato Integration
```sql
SELECT 
  p.id,
  p.title,
  p.gelato_template_id,
  p.gelato_preview_url IS NOT NULL as has_preview,
  p.gelato_template_data IS NOT NULL as has_template_data,
  p.variants->'sizes' as sizes,
  p.variants->'colors' as colors,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.gelato_template_id IS NOT NULL
GROUP BY p.id, p.title, p.gelato_template_id, p.gelato_preview_url, p.gelato_template_data, p.variants
ORDER BY p.updated_at DESC;
```

### Get Variant Details for a Product
```sql
SELECT 
  pv.gelato_variant_id,
  pv.gelato_product_id,
  pv.variant_data->>'title' as title,
  pv.variant_data->>'size' as size,
  pv.variant_data->>'color' as color,
  pv.variant_data->'variantOptions' as options,
  pv.created_at,
  pv.updated_at
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.id = 'your-product-uuid'
ORDER BY pv.variant_data->>'size', pv.variant_data->>'color';
```

### Verify Data Integrity
```sql
-- Check for products with template ID but no variants
SELECT 
  p.id,
  p.title,
  p.gelato_template_id,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.gelato_template_id IS NOT NULL
GROUP BY p.id, p.title, p.gelato_template_id
HAVING COUNT(pv.id) = 0;
```

