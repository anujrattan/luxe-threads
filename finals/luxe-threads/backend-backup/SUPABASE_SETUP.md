# Supabase Setup Guide

## Where to Add Database Configuration

Create a `.env.local` file in the `backend/` directory (copy from `.env.example`) with the following configuration:

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

# Admin Credentials (for login)
ADMIN_EMAIL=admin@luxethreads.com
ADMIN_PASSWORD=admin123
```

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Database Schema

You'll need to create the following tables in Supabase:

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  rating DECIMAL(3, 2),
  review_count INTEGER,
  tags TEXT[],
  discount TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  variants JSONB DEFAULT '{"sizes": [], "colors": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by service role" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are updatable by service role" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Products are deletable by service role" ON products
  FOR DELETE USING (true);

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by service role" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Categories are updatable by service role" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Categories are deletable by service role" ON categories
  FOR DELETE USING (true);
```

## Testing the Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create `.env.local` file with your Supabase credentials

3. Start the backend server:

   ```bash
   npm run dev
   ```

4. Test the API:
   ```bash
   curl http://localhost:3001/health
   ```

## Notes

- The backend uses the **service_role** key for all database operations (bypasses RLS)
- Frontend authentication uses JWT tokens stored in localStorage
- Admin routes require authentication + admin role
- Public routes (GET products/categories) don't require authentication
