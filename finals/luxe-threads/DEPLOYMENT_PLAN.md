# Deployment Plan & Architecture

## Frontend Deployment Options

### ❌ **Hostinger - NOT Recommended for CDN**

**Why Hostinger isn't ideal:**

- Hostinger is **shared hosting** (PHP-focused), not a CDN provider
- Limited CDN capabilities (basic caching, not global edge network)
- Not optimized for React/Vite static sites
- No automatic deployments from Git
- Limited build pipeline support

### ✅ **Recommended Frontend Options**

#### **Option 1: Vercel** ⭐ **BEST FOR REACT**

- **CDN**: Global edge network (100+ locations)
- **Features**:
  - Automatic deployments from Git
  - Zero-config for React/Vite
  - Automatic HTTPS
  - Preview deployments for PRs
  - Analytics included
- **Cost**: Free tier (100GB bandwidth/month), then $20/month
- **Setup**: Connect GitHub repo → Auto-deploys
- **Performance**: Excellent (edge-optimized)

#### **Option 2: Netlify** ⭐ **GREAT ALTERNATIVE**

- **CDN**: Global edge network
- **Features**: Similar to Vercel, slightly different pricing
- **Cost**: Free tier (100GB bandwidth/month), then $19/month
- **Setup**: Connect GitHub repo → Auto-deploys
- **Performance**: Excellent

#### **Option 3: Cloudflare Pages** ⭐ **BEST VALUE**

- **CDN**: Cloudflare's global network (fastest CDN)
- **Features**:
  - Unlimited bandwidth (free tier)
  - Automatic deployments
  - DDoS protection included
  - WAF (Web Application Firewall) included
- **Cost**: **FREE** (unlimited bandwidth, 500 builds/month)
- **Setup**: Connect GitHub repo → Auto-deploys
- **Performance**: Excellent (Cloudflare's network)

#### **Option 4: AWS S3 + CloudFront** (Advanced)

- **CDN**: CloudFront (AWS CDN)
- **Features**: Full control, enterprise-grade
- **Cost**: ~$5-20/month (pay-per-use)
- **Setup**: More complex (S3 bucket + CloudFront distribution)
- **Performance**: Excellent

**Recommendation**: **Cloudflare Pages** (free, unlimited bandwidth) or **Vercel** (best developer experience)

---

## Backend Deployment Options

### ❌ **Your Proposed Architecture: Redis Per EC2 Instance**

**Problem**: Each EC2 instance with its own Redis

```
EC2 Instance 1 → Redis 1 (local)
EC2 Instance 2 → Redis 2 (local)
EC2 Instance 3 → Redis 3 (local)
```

**Issues**:

1. **Cache Inconsistency**:

   - User hits Instance 1 → Cache miss → Fetches from DB → Caches in Redis 1
   - User hits Instance 2 → Cache miss → Fetches from DB → Caches in Redis 2
   - Same data cached 3 times, wasting memory
   - Updates on Instance 1 don't reflect on Instance 2/3

2. **Memory Waste**:

   - 3 instances = 3x memory usage
   - No shared cache benefits

3. **Cache Warming**:

   - Each instance needs to warm its own cache
   - Cold starts are slower

4. **No Failover**:
   - If Instance 1's Redis crashes, Instance 1 loses all cache
   - Other instances unaffected, but inconsistent state

### ✅ **Correct Architecture: Shared Redis**

```
                    ┌─────────────┐
                    │ Load Balancer│
                    │  (Nginx/ALB) │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │ EC2 #1  │        │ EC2 #2  │        │ EC2 #3  │
   │ Backend │        │ Backend │        │ Backend │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Shared Redis│
                    │ (ElastiCache)│
                    └─────────────┘
```

**Benefits**:

- ✅ **Single source of truth**: All instances share same cache
- ✅ **Memory efficient**: Cache stored once, used by all
- ✅ **Consistency**: Updates visible to all instances immediately
- ✅ **Failover**: Managed Redis has automatic failover

---

## Backend Deployment Options

### **Option 1: EC2 + ElastiCache (AWS)** ⭐ **RECOMMENDED**

#### Architecture:

```
Internet
   │
   ▼
AWS Application Load Balancer (ALB)
   │
   ├── EC2 Instance 1 (Backend)
   ├── EC2 Instance 2 (Backend)
   └── EC2 Instance 3 (Backend)
         │
         ▼
   ElastiCache (Redis) - Shared
         │
         ▼
   RDS (PostgreSQL) or Supabase
```

#### Setup:

1. **EC2 Instances**:

   - **Type**: `t3.medium` or `t3.large` (2-4 vCPU, 4-8GB RAM)
   - **Auto Scaling**: Min 1, Max 5 instances
   - **Scaling Triggers**: CPU > 70%, Memory > 80%
   - **AMI**: Ubuntu 22.04 LTS
   - **Setup**:
     - Install Node.js 18+
     - PM2 for process management
     - Nginx as reverse proxy (optional, ALB handles this)

2. **ElastiCache (Redis)**:

   - **Type**: `cache.t3.micro` (development) or `cache.t3.small` (production)
   - **Multi-AZ**: Enabled for failover
   - **Automatic Failover**: Enabled
   - **Connection**: All EC2 instances connect to same ElastiCache endpoint

3. **Load Balancer**:
   - **Type**: Application Load Balancer (ALB)
   - **Health Checks**: `/health` endpoint
   - **SSL Certificate**: ACM (free, auto-renewal)

#### Cost Estimate:

- **EC2**: 2x `t3.medium` = ~$60/month
- **ElastiCache**: `cache.t3.small` = ~$15/month
- **ALB**: ~$20/month
- **Data Transfer**: ~$10/month
- **Total**: ~$105/month

#### Pros:

- ✅ Full control
- ✅ Auto-scaling
- ✅ Shared Redis (solves consistency)
- ✅ High availability
- ✅ Cost-effective at scale

#### Cons:

- ⚠️ Requires DevOps knowledge
- ⚠️ Need to manage updates, security patches
- ⚠️ More setup time

---

### **Option 2: AWS ECS/Fargate** ⭐ **BETTER FOR CONTAINERS**

#### Architecture:

```
Internet
   │
   ▼
Application Load Balancer
   │
   ├── ECS Task 1 (Backend Container)
   ├── ECS Task 2 (Backend Container)
   └── ECS Task 3 (Backend Container)
         │
         ▼
   ElastiCache (Redis) - Shared
```

#### Setup:

- **Container**: Dockerize your backend
- **ECS Service**: Auto-scaling container service
- **Fargate**: Serverless containers (no EC2 management)
- **ElastiCache**: Same as Option 1

#### Cost Estimate:

- **Fargate**: ~$40-80/month (pay per use)
- **ElastiCache**: ~$15/month
- **ALB**: ~$20/month
- **Total**: ~$75-115/month

#### Pros:

- ✅ No server management
- ✅ Auto-scaling
- ✅ Easy deployments (push Docker image)
- ✅ Shared Redis

#### Cons:

- ⚠️ Need to Dockerize backend
- ⚠️ Slightly more expensive than EC2

---

### **Option 3: Railway / Render** ⭐ **EASIEST**

#### Architecture:

```
Internet
   │
   ▼
Railway/Render (Managed Platform)
   │
   ├── Backend Service 1
   ├── Backend Service 2 (auto-scaled)
   └── Backend Service 3
         │
         ▼
   Upstash Redis (External, Shared)
```

#### Setup:

- **Railway**: Connect GitHub → Auto-deploys
- **Render**: Connect GitHub → Auto-deploys
- **Redis**: Use Upstash (managed Redis, separate service)

#### Cost Estimate:

- **Railway**: $5/month + $0.000463/GB-hour (~$20-40/month)
- **Render**: $7/month per service (~$20-40/month)
- **Upstash Redis**: Free tier (10K commands/day) or $0.20/100K commands (~$10-20/month)
- **Total**: ~$30-60/month

#### Pros:

- ✅ Easiest setup (GitHub → Deploy)
- ✅ Auto-scaling
- ✅ No DevOps needed
- ✅ Shared Redis (Upstash)

#### Cons:

- ⚠️ Less control
- ⚠️ Vendor lock-in
- ⚠️ Can get expensive at scale

---

### **Option 4: DigitalOcean App Platform** ⭐ **GOOD MIDDLE GROUND**

#### Architecture:

Similar to Railway/Render, but more control

#### Cost Estimate:

- **App Platform**: $12/month per service (~$25-50/month)
- **Managed Redis**: $15/month
- **Total**: ~$40-65/month

#### Pros:

- ✅ Easy setup
- ✅ Good balance of control vs. ease
- ✅ Shared Redis included

---

## Recommended Architecture

### **For Your Use Case (100-500 concurrent users)**

#### **Frontend**: Cloudflare Pages (FREE)

- Unlimited bandwidth
- Global CDN
- Automatic deployments
- **Cost**: $0/month

#### **Backend**: EC2 + ElastiCache (AWS)

- 2-3 EC2 instances (auto-scaled)
- Shared ElastiCache Redis
- Application Load Balancer
- **Cost**: ~$105/month

#### **Database**: Supabase (Keep as-is)

- Already using Supabase
- Managed PostgreSQL
- **Cost**: $0-25/month (Free/Pro plan)

#### **Total Monthly Cost**: ~$105-130/month

---

## Redis Architecture Solutions

### **Solution 1: AWS ElastiCache** ⭐ **RECOMMENDED**

**Setup**:

```typescript
// backend/src/services/redis.ts
import Redis from "ioredis";
import { config } from "../config/index.js";

// Connect to ElastiCache endpoint
const redisClient = new Redis(config.redis.url, {
  // ElastiCache endpoint: your-cluster.xxxxx.cache.amazonaws.com:6379
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});
```

**Configuration**:

- **Endpoint**: Single endpoint for all EC2 instances
- **Multi-AZ**: Enabled (automatic failover)
- **Backup**: Daily snapshots
- **Security**: VPC-only access (EC2 instances in same VPC)

**Cost**: ~$15/month (`cache.t3.small`)

---

### **Solution 2: Upstash Redis** ⭐ **EASIEST**

**Setup**:

```typescript
// Same code, just different endpoint
const redisClient = new Redis(config.redis.url, {
  // Upstash endpoint: your-redis.upstash.io:6379
  // Or use REST API (no connection pooling needed)
});
```

**Configuration**:

- **Global**: Available from anywhere (not VPC-locked)
- **Serverless**: Pay per request
- **Free Tier**: 10K commands/day
- **Auto-scaling**: Handles traffic spikes

**Cost**: Free tier or ~$0.20/100K commands (~$10-20/month)

---

### **Solution 3: Redis Cloud** ⭐ **ALTERNATIVE**

**Setup**: Similar to Upstash, managed Redis service

**Cost**: ~$10-30/month

---

## Implementation Steps

### **Phase 1: Frontend (Week 1)**

1. **Deploy to Cloudflare Pages**:

   ```bash
   # Build frontend
   cd frontend
   npm run build

   # Connect GitHub repo to Cloudflare Pages
   # Auto-deploys on every push
   ```

2. **Update API URL**:
   - Set `VITE_API_BASE_URL` to your backend URL
   - Use environment variables in Cloudflare Pages

**Time**: 30 minutes
**Cost**: $0/month

---

### **Phase 2: Backend Setup (Week 2)**

#### **Option A: EC2 + ElastiCache (Recommended)**

1. **Create ElastiCache Cluster**:

   - AWS Console → ElastiCache → Create Redis cluster
   - Type: `cache.t3.small`
   - Multi-AZ: Enabled
   - Security: VPC-only

2. **Launch EC2 Instances**:

   - AMI: Ubuntu 22.04 LTS
   - Type: `t3.medium` (2 instances initially)
   - Security Group: Allow port 3001 from ALB
   - User Data Script:
     ```bash
     #!/bin/bash
     apt-get update
     apt-get install -y nodejs npm
     npm install -g pm2
     # Clone repo, install deps, start app
     ```

3. **Create Application Load Balancer**:

   - Target Group: EC2 instances
   - Health Check: `/health`
   - SSL Certificate: ACM

4. **Update Redis Config**:

   ```typescript
   // backend/.env
   REDIS_URL=redis://your-elasticache-endpoint:6379
   ```

5. **Auto Scaling Group**:
   - Min: 1, Max: 5
   - Scale on CPU > 70%

**Time**: 2-3 hours
**Cost**: ~$105/month

---

#### **Option B: Railway/Render (Easier)**

1. **Create Upstash Redis**:

   - Sign up → Create Redis database
   - Copy connection URL

2. **Deploy to Railway/Render**:

   - Connect GitHub repo
   - Set environment variables:
     - `REDIS_URL=redis://your-upstash-endpoint:6379`
     - `SUPABASE_URL=...`
     - `JWT_SECRET=...`

3. **Auto-scaling**:
   - Railway/Render handles this automatically

**Time**: 30 minutes
**Cost**: ~$30-60/month

---

## Cost Comparison

| Option           | Frontend              | Backend           | Redis             | Total/Month |
| ---------------- | --------------------- | ----------------- | ----------------- | ----------- |
| **Recommended**  | Cloudflare Pages ($0) | EC2 + ALB ($80)   | ElastiCache ($15) | **$95**     |
| **Easy Setup**   | Cloudflare Pages ($0) | Railway ($30)     | Upstash ($10)     | **$40**     |
| **Full Control** | Cloudflare Pages ($0) | EC2 + ALB ($80)   | ElastiCache ($15) | **$95**     |
| **Container**    | Cloudflare Pages ($0) | ECS Fargate ($60) | ElastiCache ($15) | **$75**     |

---

## Migration Checklist

### **Frontend**

- [ ] Build frontend (`npm run build`)
- [ ] Create Cloudflare Pages project
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Test deployment
- [ ] Update DNS (if using custom domain)

### **Backend**

- [ ] Choose deployment option (EC2 vs Railway)
- [ ] Set up Redis (ElastiCache or Upstash)
- [ ] Update `REDIS_URL` in backend config
- [ ] Deploy backend
- [ ] Set up load balancer (if EC2)
- [ ] Configure auto-scaling
- [ ] Set up health checks
- [ ] Test Redis connection from all instances
- [ ] Monitor cache hit rates

### **Database**

- [ ] Keep Supabase (no changes needed)
- [ ] Verify connection from new backend instances
- [ ] Test order creation, payments

---

## Monitoring & Alerts

### **Essential Metrics**

1. **Backend**:

   - CPU usage per instance
   - Memory usage
   - Request rate
   - Response times (p50, p95, p99)
   - Error rate

2. **Redis**:

   - Memory usage
   - Hit rate
   - Connection count
   - Commands per second

3. **Load Balancer**:
   - Active connections
   - Request count
   - 4xx/5xx errors

### **Tools**

- **AWS CloudWatch** (if using EC2)
- **Upstash Dashboard** (if using Upstash)
- **Sentry** (error tracking)
- **UptimeRobot** (uptime monitoring)

---

## Security Considerations

### **EC2 Setup**

- ✅ Security Groups: Only allow ALB → EC2 (port 3001)
- ✅ VPC: Private subnets for EC2, public for ALB
- ✅ ElastiCache: VPC-only access
- ✅ SSL: ACM certificate on ALB
- ✅ Secrets: Use AWS Secrets Manager or environment variables

### **Redis Security**

- ✅ ElastiCache: VPC-only (not publicly accessible)
- ✅ Upstash: Password-protected, TLS enabled
- ✅ Connection: Use `redis://` or `rediss://` (TLS)

---

## Next Steps

1. **This Week**: Deploy frontend to Cloudflare Pages
2. **Next Week**: Set up backend (choose EC2 or Railway)
3. **Week 3**: Set up shared Redis (ElastiCache or Upstash)
4. **Week 4**: Configure auto-scaling and monitoring

**Recommendation**: Start with **Railway + Upstash** (easiest), then migrate to **EC2 + ElastiCache** when you need more control or lower costs at scale.
