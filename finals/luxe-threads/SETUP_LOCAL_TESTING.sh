#!/bin/bash

# Local Testing Setup Script
# Run this script to set up and test the Shopify connection locally

echo "🚀 Setting up local testing environment..."
echo ""

# Step 1: Install backend dependencies
echo "📦 Step 1: Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Backend dependencies already installed"
fi
cd ..

# Step 2: Create .env.local file
echo ""
echo "📝 Step 2: Setting up environment file..."
cd backend
if [ ! -f ".env.local" ]; then
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo "✅ Created .env.local from example"
        echo "⚠️  IMPORTANT: Edit backend/.env.local and add your Shopify credentials!"
        echo "   - SHOPIFY_STORE_DOMAIN"
        echo "   - SHOPIFY_STOREFRONT_ACCESS_TOKEN"
    else
        echo "❌ env.local.example not found"
    fi
else
    echo "✅ .env.local already exists"
fi
cd ..

# Step 3: Check frontend dependencies
echo ""
echo "📦 Step 3: Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

# Step 4: Verify setup
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env.local and add your Shopify credentials"
echo "2. In terminal 1, run: cd backend && npm run dev"
echo "3. In terminal 2, run: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000 to test"
echo ""
echo "🔍 Test endpoints:"
echo "   - Backend health: http://localhost:3001/health"
echo "   - Backend products: http://localhost:3001/api/products"
echo "   - Frontend: http://localhost:3000"


