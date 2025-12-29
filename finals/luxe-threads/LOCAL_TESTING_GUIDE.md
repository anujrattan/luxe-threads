# Local Testing Guide - Shopify Connection

## 🚀 Quick Start

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env.local File
Copy `env.local.example` to `.env.local` and fill in your Shopify credentials.

### Step 3: Start Backend
```bash
cd backend
npm run dev
```
Backend should run on `http://localhost:3001`

### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm install  # if not already installed
npm run dev
```
Frontend should run on `http://localhost:3000`

### Step 5: Test Connection
1. Visit `http://localhost:3001/health` - Should show backend status
2. Visit `http://localhost:3000` - Should load frontend
3. Check browser console for API calls

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint works: `http://localhost:3001/health`
- [ ] Frontend starts without errors
- [ ] Frontend can call backend API
- [ ] Products load from Shopify (if configured)
- [ ] Categories load from Shopify (if configured)

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify .env.local exists and has correct values
- Check Node.js version (need 18+)

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` in frontend is `http://localhost:3001/api`
- Check CORS settings in backend
- Check browser console for errors

### Shopify API errors
- Verify `SHOPIFY_STORE_DOMAIN` is correct
- Verify `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is valid
- Check backend console for detailed error messages


