# Quick Start - Local Testing

## 🎯 Goal
Test the connection between Frontend → Backend → Shopify locally.

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Shopify Store** created (or test store)
3. **Shopify Storefront API Token** (see [ENV_SETUP.md](./backend/ENV_SETUP.md))

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Backend Environment

Create `.env.local` file in `backend/` directory:

```bash
cd backend
cp env.local.example .env.local
```

Then edit `.env.local` and add your Shopify credentials:

```env
# Required - Your Shopify store domain
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# Required - Your Storefront API token
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# Optional - For admin operations
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# Frontend URL (for CORS)
CORS_ORIGIN=http://localhost:3000
```

**📖 Don't have Shopify credentials yet?** See [backend/ENV_SETUP.md](./backend/ENV_SETUP.md) for step-by-step instructions.

### Step 3: Start Backend Server

**Terminal 1:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
🌍 Environment: development
🛍️  Shopify Store: your-store.myshopify.com
```

**Test backend:**
- Visit: http://localhost:3001/health
- Should return: `{"status":"ok","timestamp":"...","shopify":{...}}`

### Step 4: Start Frontend Server

**Terminal 2:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Test frontend:**
- Visit: http://localhost:3000
- Should load your React app

### Step 5: Test Connection

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return JSON with status and Shopify config.

2. **Backend Products API:**
   ```bash
   curl http://localhost:3001/api/products
   ```
   Should return products from Shopify (if configured).

3. **Frontend → Backend:**
   - Open browser console (F12)
   - Visit http://localhost:3000
   - Check Network tab for API calls
   - Should see calls to `http://localhost:3001/api/products`

4. **Test in Browser:**
   - Visit http://localhost:3000
   - Navigate to products page
   - Check if products load from Shopify

## ✅ Success Indicators

- ✅ Backend starts without errors
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ Frontend starts without errors
- ✅ Frontend can make API calls to backend
- ✅ Products load from Shopify (if store has products)
- ✅ No CORS errors in browser console

## 🐛 Troubleshooting

### Backend won't start

**Error: "Port 3001 already in use"**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Error: "Shopify Storefront API not configured"**
- Check `.env.local` exists in `backend/` directory
- Verify `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are set
- Restart backend server

**Error: "Cannot find module"**
```bash
cd backend
npm install
```

### Frontend can't connect to backend

**CORS Error:**
- Check `CORS_ORIGIN` in backend `.env.local` is `http://localhost:3000`
- Restart backend after changing `.env.local`

**404 Error:**
- Verify backend is running on port 3001
- Check `VITE_API_BASE_URL` in frontend (should be `http://localhost:3001/api`)

**Network Error:**
- Check backend is running
- Check browser console for detailed error
- Verify API URL is correct

### Shopify API Errors

**Error: "Invalid access token"**
- Verify token is correct in `.env.local`
- Check token hasn't expired
- Regenerate token from Shopify Admin if needed

**Error: "Store not found"**
- Verify `SHOPIFY_STORE_DOMAIN` is correct format: `store-name.myshopify.com`
- Check store exists and is active

**No products returned:**
- Check if Shopify store has products
- Verify products are published
- Check Shopify Admin → Products

## 📊 Testing Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env.local` created with Shopify credentials
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Health endpoint works
- [ ] Products API works
- [ ] Frontend can call backend
- [ ] Products display in frontend
- [ ] No console errors

## 🎯 Next Steps After Local Testing

Once local testing works:

1. **Deploy Backend:**
   - Choose hosting (Railway, Render, etc.)
   - Set environment variables
   - Deploy and get URL

2. **Deploy Frontend:**
   - Update `VITE_API_BASE_URL` to backend URL
   - Deploy to Vercel/Netlify
   - Update backend `CORS_ORIGIN` to frontend URL

3. **Test Production:**
   - Test full flow
   - Verify checkout works
   - Test POD fulfillment

## 💡 Tips

- Keep both terminals open (backend + frontend)
- Check backend console for API errors
- Check browser console for frontend errors
- Use browser Network tab to debug API calls
- Test with a Shopify development store first


