# Environment Variables Setup Guide

## Overview

This project uses separate `.env.local` files for frontend and backend. These files are gitignored and should be created locally.

## Frontend `.env.local`

Create `frontend/.env.local` with the following:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Frontend Port (optional - usually set in vite.config.ts or package.json)
# VITE_PORT=3000
```

**Notes:**

- All frontend environment variables must be prefixed with `VITE_` to be accessible in the code
- Frontend only needs the backend API URL
- JWT tokens are stored in localStorage, not in env vars

## Backend `.env.local`

Create `backend/.env.local` with the following:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DEFAULT_TTL=3600

# Gelato Print-on-Demand API Configuration
GELATO_API_KEY=your-gelato-api-key-here
GELATO_STORE_ID=your-store-id-here
# Gelato uses different base URLs for different services
GELATO_ECOMMERCE_API_BASE_URL=https://ecommerce.gelatoapis.com/v1
GELATO_ORDER_API_BASE_URL=https://order.gelatoapis.com/v4
GELATO_PRODUCT_API_BASE_URL=https://product.gelatoapis.com/v3
GELATO_SHIPMENT_API_BASE_URL=https://shipment.gelatoapis.com/v1
GELATO_WEBHOOK_SECRET=your-webhook-secret-here
NGROK_URL=https://abc123.ngrok-free.app

# Admin Credentials (for login)
ADMIN_EMAIL=admin@luxethreads.com
ADMIN_PASSWORD=admin123
```

**Notes:**

- Backend contains all sensitive keys (Supabase, JWT, etc.)
- Frontend URL is used for CORS configuration
- Admin credentials are used for the login endpoint

## Quick Setup

1. **Frontend:**

   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.local
   ```

2. **Backend:**
   ```bash
   cd backend
   # Copy the template and fill in your values
   cp .env.example .env.local
   # Then edit .env.local with your Supabase credentials
   ```

## Security Notes

- Never commit `.env.local` files to git (they're already in .gitignore)
- Use strong, unique values for `JWT_SECRET` in production
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it bypasses Row Level Security
- Use different credentials for development and production
