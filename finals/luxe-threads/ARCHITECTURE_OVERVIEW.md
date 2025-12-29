# Architecture Overview - Headless Shopify Setup

## 🏗️ Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
│   Hosted on:    │
│   - Vercel      │
│   - Netlify     │
│   - Cloudflare  │
│   - AWS S3+CF   │
└────────┬────────┘
         │
         │ HTTP/REST API Calls
         │
┌────────▼────────┐
│   Backend API   │
│   (Express.js)  │
│   Hosted on:    │
│   - Railway     │
│   - Render      │
│   - Heroku      │
│   - AWS/EC2     │
│   - DigitalOcean│
└────────┬────────┘
         │
         │ GraphQL/REST API
         │ (Storefront API)
         │
┌────────▼────────┐
│    Shopify      │
│   Store + POD   │
│   - Products    │
│   - Collections │
│   - Orders      │
│   - Fulfillment │
└─────────────────┘
```

## 📦 Component Breakdown

### 1. **Frontend (React App)**
- **Location:** Separate hosting (Vercel, Netlify, etc.)
- **Technology:** React 19 + TypeScript + Tailwind
- **Communication:** Makes API calls to your backend
- **No direct Shopify connection** (goes through backend)

### 2. **Backend API (Express.js)**
- **Location:** Separate hosting (Railway, Render, etc.)
- **Technology:** Node.js + Express + TypeScript
- **Role:** Proxy layer between frontend and Shopify
- **Communication:**
  - Receives requests from frontend
  - Makes GraphQL calls to Shopify Storefront API
  - Returns formatted data to frontend

### 3. **Shopify Store**
- **Location:** Shopify's infrastructure
- **Role:** Product catalog, cart, checkout, fulfillment
- **Access:** Via Storefront API (public) and Admin API (admin)

## 🔄 Request Flow

### Example: User Views Products

```
1. User visits your site (Frontend)
   ↓
2. Frontend makes API call:
   GET https://your-backend.com/api/products
   ↓
3. Backend receives request
   ↓
4. Backend calls Shopify Storefront API:
   POST https://your-store.myshopify.com/api/2024-01/graphql.json
   ↓
5. Shopify returns product data
   ↓
6. Backend transforms data to match frontend format
   ↓
7. Backend returns JSON to frontend
   ↓
8. Frontend renders products
```

### Example: User Adds to Cart

```
1. User clicks "Add to Cart" (Frontend)
   ↓
2. Frontend makes API call:
   POST https://your-backend.com/api/checkout
   Body: { lineItems: [...] }
   ↓
3. Backend receives request
   ↓
4. Backend calls Shopify Storefront API:
   mutation checkoutCreate { ... }
   ↓
5. Shopify creates checkout session
   ↓
6. Backend returns checkout URL
   ↓
7. Frontend redirects user to Shopify checkout
```

## 🌐 Hosting Options

### Frontend Hosting

**Recommended:**
- **Vercel** ⭐ (Best for React, free tier, easy deployment)
- **Netlify** ⭐ (Great for React, free tier, easy deployment)
- **Cloudflare Pages** (Fast, free tier)

**Also works:**
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting

**Requirements:**
- Static hosting (React builds to static files)
- Environment variable support (for API URL)
- Custom domain support

### Backend Hosting

**Recommended:**
- **Railway** ⭐ (Easy, good free tier, auto-deploy)
- **Render** ⭐ (Easy, free tier, auto-deploy)
- **Fly.io** (Good free tier)

**Also works:**
- Heroku (paid)
- AWS EC2/Elastic Beanstalk
- DigitalOcean App Platform
- Google Cloud Run

**Requirements:**
- Node.js runtime
- Environment variable support
- Persistent storage (optional, for sessions)
- HTTPS support

## 🔐 Environment Variables

### Frontend (.env)

```env
# Backend API URL
VITE_API_BASE_URL=https://your-backend.railway.app/api

# Or for production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Backend (.env.local)

```env
# Server
PORT=3001
NODE_ENV=production

# CORS (your frontend URL)
CORS_ORIGIN=https://your-frontend.vercel.app

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2024-01
```

## 🔒 Security Considerations

### Frontend
- ✅ No Shopify credentials exposed
- ✅ Only backend API URL in environment
- ✅ All sensitive operations go through backend

### Backend
- ✅ Shopify tokens stored server-side only
- ✅ CORS configured to only allow your frontend
- ✅ No direct database (Shopify is the source of truth)

### Shopify
- ✅ Storefront token is public-facing (limited permissions)
- ✅ Admin token stays server-side only
- ✅ Shopify handles all payment processing

## 📊 Benefits of This Architecture

### 1. **Separation of Concerns**
- Frontend: UI/UX only
- Backend: Business logic, API integration
- Shopify: Data storage, fulfillment

### 2. **Scalability**
- Frontend: CDN caching (very fast)
- Backend: Can scale independently
- Shopify: Handles all product/order management

### 3. **Flexibility**
- Can change frontend without affecting backend
- Can change backend without affecting frontend
- Shopify handles all e-commerce complexity

### 4. **Cost Efficiency**
- Frontend: Usually free (Vercel/Netlify free tier)
- Backend: Low cost ($5-20/month)
- Shopify: $29/month (includes everything)

## 🚀 Deployment Checklist

### Frontend Deployment
- [ ] Build React app: `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Set environment variable: `VITE_API_BASE_URL`
- [ ] Configure custom domain (optional)
- [ ] Test API connection

### Backend Deployment
- [ ] Set up hosting (Railway/Render)
- [ ] Configure environment variables
- [ ] Deploy code
- [ ] Test health endpoint
- [ ] Configure CORS for frontend URL
- [ ] Test Shopify API connection

### Shopify Setup
- [ ] Create Shopify store
- [ ] Get Storefront API token
- [ ] Get Admin API token (optional)
- [ ] Add products
- [ ] Create collections
- [ ] Install POD app (Printful/Printify)
- [ ] Test checkout flow

## 🔄 Data Flow Examples

### Product Listing
```
Frontend → Backend → Shopify Storefront API → Backend → Frontend
```

### Add to Cart
```
Frontend → Backend → Shopify Checkout API → Shopify Checkout Page
```

### Order Fulfillment
```
Customer → Shopify Checkout → Shopify → POD App → Fulfillment
```

## 📝 Next Steps

1. **Deploy Backend:**
   - Choose hosting (Railway recommended)
   - Set environment variables
   - Deploy and test

2. **Deploy Frontend:**
   - Update API URL in frontend
   - Deploy to Vercel/Netlify
   - Test connection

3. **Connect Everything:**
   - Test product listing
   - Test checkout flow
   - Verify POD fulfillment

## 🆘 Common Issues

### CORS Errors
**Problem:** Frontend can't call backend
**Solution:** Update `CORS_ORIGIN` in backend to match frontend URL

### API Not Found
**Problem:** Frontend can't reach backend
**Solution:** Check `VITE_API_BASE_URL` in frontend environment

### Shopify Auth Errors
**Problem:** Backend can't connect to Shopify
**Solution:** Verify `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is correct

### Checkout Not Working
**Problem:** Checkout URL not redirecting
**Solution:** Check Shopify store domain and API version


