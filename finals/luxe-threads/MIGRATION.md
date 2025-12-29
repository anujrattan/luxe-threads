# Migration Guide

This document explains the new project structure and how to migrate from the old structure.

## New Structure

The project has been reorganized into a clean `frontend/` and `backend/` structure following industry best practices.

### Frontend (`frontend/`)

All frontend code has been moved to `frontend/src/`:

- **Components**: `frontend/src/components/`
- **Pages**: `frontend/src/pages/`
- **Services**: `frontend/src/services/` (renamed from `mockApi.ts` to `api.ts`)
- **Types**: `frontend/src/types/`
- **Utils**: `frontend/src/utils/` (new - contains constants)
- **Styles**: `frontend/src/styles/` (new - contains global CSS)

### Backend (`backend/`)

A new backend structure has been created:

- **Config**: `backend/src/config/`
- **Controllers**: `backend/src/controllers/` (placeholder)
- **Middleware**: `backend/src/middleware/` (placeholder)
- **Models**: `backend/src/models/` (placeholder)
- **Routes**: `backend/src/routes/` (placeholder)
- **Services**: `backend/src/services/` (placeholder)
- **Types**: `backend/src/types/`
- **Utils**: `backend/src/utils/` (placeholder)

## Changes Made

### 1. Import Path Updates

All imports have been updated to use the new structure:
- `../services/mockApi` → `../services/api`
- Added constants file for shared values (tax rate, storage keys, etc.)

### 2. Configuration Files

- **Frontend**: New `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- **Backend**: New `package.json`, `tsconfig.json`

### 3. Environment Variables

- Frontend uses `VITE_` prefix for environment variables
- Backend uses standard Node.js environment variables
- Created `.env.example` templates (see README files)

### 4. Code Improvements

- Extracted magic numbers to constants (`TAX_RATE`, `CART_STORAGE_KEY`, etc.)
- Fixed typo in `ProductDetailPage.tsx` (`</aButton>` → `</Button>`)
- Updated `LoginPage` to use constants for admin password
- Updated `CheckoutPage` and `CartPage` to use `TAX_RATE` constant

## Next Steps

### 1. Clean Up Old Files (Optional)

The old files in the root directory can be removed:
- `App.tsx`
- `index.tsx`
- `index.html`
- `components/`
- `pages/`
- `services/`
- `types.ts`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Set Up Environment Variables

```bash
# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with your values

# Backend
cd ../backend
cp .env.example .env
# Edit .env with your values
```

### 4. Start Development

```bash
# Frontend (terminal 1)
cd frontend
npm run dev

# Backend (terminal 2)
cd backend
npm run dev
```

## Benefits of New Structure

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **Scalability**: Easy to add new features and services
3. **Maintainability**: Organized code structure following industry standards
4. **Team Collaboration**: Multiple developers can work on frontend/backend independently
5. **Deployment**: Frontend and backend can be deployed separately
6. **Testing**: Easier to write and organize tests
7. **Type Safety**: Shared types can be maintained separately

## Notes

- The old files in the root directory are still present for reference
- All functionality should work the same as before
- The backend is currently a placeholder - full implementation is planned
- Consider migrating to React Router for better routing management
- Consider adding state management (Context API, Zustand, or Redux) for complex state

