# AdminPage Refactoring Plan

## Current Structure Analysis

**File**: `frontend/src/pages/AdminPage.tsx` (~2988 lines)

### Current Components:
1. **ProductForm** (lines 16-1510) - ~1494 lines
   - Product creation/editing form
   - Complex state management for images, videos, variants
   - File upload handling
   - Mockup images by color

2. **CategoryForm** (lines 1512-1869) - ~357 lines
   - Category creation/editing form
   - Image upload handling
   - Slug generation

3. **AdminPage** (lines 1871-2987) - ~1116 lines
   - Main admin page container
   - Tab navigation (categories, products, orders, analytics)
   - Sidebar with stats
   - Multiple view components (categories grid, products table, orders list/detail)

## Proposed Structure

### New File Organization

```
frontend/src/
├── pages/
│   ├── AdminPage.tsx (main container, ~200-300 lines)
│   └── admin/
│       ├── components/
│       │   ├── AdminSidebar.tsx
│       │   ├── AdminHeader.tsx
│       │   ├── CategoriesView.tsx
│       │   ├── ProductsView.tsx
│       │   ├── OrdersView.tsx
│       │   ├── OrderDetailView.tsx
│       │   ├── ProductForm.tsx (extracted from current ProductForm)
│       │   └── CategoryForm.tsx (extracted from current CategoryForm)
│       └── hooks/
│           ├── useAdminData.ts
│           └── useAdminOrders.ts
```

## Detailed Breakdown

### 1. Extract ProductForm
**File**: `frontend/src/pages/admin/components/ProductForm.tsx`

**What to extract**:
- Entire ProductForm component (lines 16-1510)
- All its internal state and handlers
- All imports it needs

**Dependencies**:
- `Product`, `Category` types
- `api` service
- UI components: `Button`, `Card`, `Input`
- `ProductCardPreview` component
- Currency utilities
- Color utilities
- Icons

**Export**: `export { ProductForm }`

**Import changes needed**:
- Update `AdminPage.tsx` to import from new location

---

### 2. Extract CategoryForm
**File**: `frontend/src/pages/admin/components/CategoryForm.tsx`

**What to extract**:
- Entire CategoryForm component (lines 1512-1869)
- All its internal state and handlers
- All imports it needs

**Dependencies**:
- `Category` type
- `api` service
- UI components: `Button`, `Card`, `Input`
- Icons

**Export**: `export { CategoryForm }`

**Import changes needed**:
- Update `AdminPage.tsx` to import from new location

---

### 3. Extract AdminSidebar
**File**: `frontend/src/pages/admin/components/AdminSidebar.tsx`

**What to extract** (from AdminPage):
- Sidebar navigation (lines ~2079-2282)
- Stats cards for each tab
- Tab switching logic

**Props needed**:
```typescript
interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    failed: number;
  };
}
```

**Dependencies**:
- `AdminTab` type (needs to be exported from AdminPage or types file)
- Icons
- `Card` component

**Export**: `export { AdminSidebar }`

---

### 4. Extract AdminHeader
**File**: `frontend/src/pages/admin/components/AdminHeader.tsx`

**What to extract** (from AdminPage):
- Header section with title and add button (lines ~2288-2321)

**Props needed**:
```typescript
interface AdminHeaderProps {
  activeTab: AdminTab;
  onAddNew: () => void;
}
```

**Dependencies**:
- `Button` component
- Icons

**Export**: `export { AdminHeader }`

---

### 5. Extract CategoriesView
**File**: `frontend/src/pages/admin/components/CategoriesView.tsx`

**What to extract** (from AdminPage):
- Categories grid view (lines ~2334-2450)
- Loading state
- Empty state
- Category cards with edit/delete actions

**Props needed**:
```typescript
interface CategoriesViewProps {
  categories: Category[];
  loading: boolean;
  failedCategoryImages: Set<string>;
  onImageError: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentState: boolean) => Promise<void>;
  togglingCategory: string | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}
```

**Dependencies**:
- `Category` type
- `Card`, `Button` components
- `Toggle` component
- Icons
- `api` service (for toggleCategoryActive)

**Export**: `export { CategoriesView }`

---

### 6. Extract ProductsView
**File**: `frontend/src/pages/admin/components/ProductsView.tsx`

**What to extract** (from AdminPage):
- Products table view (lines ~2451-2576)
- Loading state
- Empty state
- Product table rows

**Props needed**:
```typescript
interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  currency: string;
  failedProductImages: Set<string>;
  onImageError: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}
```

**Dependencies**:
- `Product`, `Category` types
- `Card`, `Button` components
- Icons
- Currency utilities

**Export**: `export { ProductsView }`

---

### 7. Extract OrdersView
**File**: `frontend/src/pages/admin/components/OrdersView.tsx`

**What to extract** (from AdminPage):
- Orders list table (lines ~2896-2978)
- Loading state
- Empty state

**Props needed**:
```typescript
interface OrdersViewProps {
  orders: any[];
  loading: boolean;
  currency: string;
  onSelectOrder: (order: any) => void;
}
```

**Dependencies**:
- `Card` component
- Icons
- Currency utilities

**Export**: `export { OrdersView }`

---

### 8. Extract OrderDetailView
**File**: `frontend/src/pages/admin/components/OrderDetailView.tsx`

**What to extract** (from AdminPage):
- Order detail view (lines ~2603-2894)
- Order status update
- Fulfillment partner update
- Partner order ID input

**Props needed**:
```typescript
interface OrderDetailViewProps {
  order: any;
  orderProducts: Record<string, any>;
  currency: string;
  onClose: () => void;
  onStatusUpdate: (orderNumber: string, status: string) => Promise<void>;
  onFulfillmentPartnerUpdate: (orderNumber: string, partner: string | null) => Promise<void>;
  onPartnerOrderIdUpdate: (orderNumber: string, orderId: string | null) => Promise<void>;
  updatingStatus: boolean;
  updatingFulfillmentPartner: boolean;
  updatingPartnerOrderId: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
}
```

**Dependencies**:
- `Card`, `Button`, `Input`, `Select` components
- Icons
- Currency utilities
- `api` service

**Export**: `export { OrderDetailView }`

---

### 9. Create Custom Hooks

#### useAdminData Hook
**File**: `frontend/src/pages/admin/hooks/useAdminData.ts`

**What to extract**:
- Products fetching logic
- Categories fetching logic
- Loading states
- Refetch functions

**Returns**:
```typescript
{
  products: Product[];
  categories: Category[];
  productsLoading: boolean;
  categoriesLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  refetchAll: () => Promise<void>;
}
```

---

#### useAdminOrders Hook
**File**: `frontend/src/pages/admin/hooks/useAdminOrders.ts`

**What to extract**:
- Orders fetching logic
- Order selection logic
- Order products fetching
- Order update handlers

**Returns**:
```typescript
{
  orders: any[];
  selectedOrder: any | null;
  orderProducts: Record<string, any>;
  ordersLoading: boolean;
  updatingStatus: boolean;
  updatingFulfillmentPartner: boolean;
  updatingPartnerOrderId: boolean;
  partnerOrderIdInput: string;
  fetchOrders: () => Promise<void>;
  selectOrder: (order: any) => void;
  clearSelection: () => void;
  updateOrderStatus: (orderNumber: string, status: string) => Promise<void>;
  updateFulfillmentPartner: (orderNumber: string, partner: string | null) => Promise<void>;
  updatePartnerOrderId: (orderNumber: string, orderId: string | null) => Promise<void>;
  setPartnerOrderIdInput: (value: string) => void;
}
```

---

### 10. Export AdminTab Type
**File**: `frontend/src/pages/admin/types.ts` (new file)

**What to create**:
```typescript
export type AdminTab = 'categories' | 'products' | 'orders' | 'analytics';
```

**Import changes needed**:
- Update all files that use `AdminTab` to import from this file

---

## Implementation Steps

### Phase 1: Create Directory Structure
1. Create `frontend/src/pages/admin/` directory
2. Create `frontend/src/pages/admin/components/` directory
3. Create `frontend/src/pages/admin/hooks/` directory
4. Create `frontend/src/pages/admin/types.ts`

### Phase 2: Extract Types
1. Create `types.ts` with `AdminTab` export
2. Update `AdminPage.tsx` to import from types file

### Phase 3: Extract Forms (Lowest Risk)
1. Extract `ProductForm` to `admin/components/ProductForm.tsx`
2. Extract `CategoryForm` to `admin/components/CategoryForm.tsx`
3. Update imports in `AdminPage.tsx`
4. Test that forms still work

### Phase 4: Extract Custom Hooks
1. Create `useAdminData.ts` hook
2. Create `useAdminOrders.ts` hook
3. Update `AdminPage.tsx` to use hooks
4. Test data fetching

### Phase 5: Extract View Components
1. Extract `CategoriesView.tsx`
2. Extract `ProductsView.tsx`
3. Extract `OrdersView.tsx`
4. Extract `OrderDetailView.tsx`
5. Update `AdminPage.tsx` to use components
6. Test each view

### Phase 6: Extract Layout Components
1. Extract `AdminSidebar.tsx`
2. Extract `AdminHeader.tsx`
3. Update `AdminPage.tsx` to use components
4. Test layout

### Phase 7: Cleanup and Finalize
1. Remove unused imports from `AdminPage.tsx`
2. Ensure all exports are correct
3. Run linter and fix any issues
4. Test all functionality end-to-end

---

## Files That Need Import Updates

### Files to Update:
1. **`frontend/src/pages/AdminPage.tsx`**
   - Remove ProductForm and CategoryForm definitions
   - Import from new locations
   - Import view components
   - Import hooks
   - Import types

2. **`frontend/src/App.tsx`** (if needed)
   - No changes needed (already imports AdminPage)

---

## Risk Assessment

### Low Risk:
- Extracting ProductForm and CategoryForm (already separate components)
- Creating types file
- Extracting hooks (isolated logic)

### Medium Risk:
- Extracting view components (need to pass props correctly)
- Extracting layout components (need to maintain state flow)

### High Risk:
- State management between components (need careful prop drilling or context)
- Order detail view (complex state interactions)

---

## Testing Checklist

After refactoring, test:
- [ ] Categories tab: view, create, edit, delete, toggle active
- [ ] Products tab: view, create, edit, delete
- [ ] Orders tab: view list, view details, update status
- [ ] Orders tab: update fulfillment partner
- [ ] Orders tab: update partner order ID
- [ ] Analytics tab: loads correctly
- [ ] Sidebar navigation works
- [ ] Stats cards show correct data
- [ ] Image error handling works
- [ ] All forms submit correctly
- [ ] Loading states work
- [ ] Empty states display correctly

---

## Estimated Line Count After Refactoring

- `AdminPage.tsx`: ~200-300 lines (main container)
- `ProductForm.tsx`: ~1494 lines (no change)
- `CategoryForm.tsx`: ~357 lines (no change)
- `AdminSidebar.tsx`: ~200 lines
- `AdminHeader.tsx`: ~50 lines
- `CategoriesView.tsx`: ~200 lines
- `ProductsView.tsx`: ~150 lines
- `OrdersView.tsx`: ~100 lines
- `OrderDetailView.tsx`: ~300 lines
- `useAdminData.ts`: ~100 lines
- `useAdminOrders.ts`: ~150 lines
- `types.ts`: ~5 lines

**Total**: ~3306 lines (slightly more due to imports/exports, but much better organized)

---

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be reused or tested independently
3. **Readability**: Smaller files are easier to understand
4. **Performance**: Better code splitting opportunities
5. **Testing**: Easier to write unit tests for individual components
6. **Collaboration**: Multiple developers can work on different components

---

## Notes

- All components should maintain the same functionality
- Props should be typed properly
- Consider using React.memo for performance if needed
- Keep error handling consistent
- Maintain the same styling and UI/UX

