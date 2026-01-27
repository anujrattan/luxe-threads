# Minimal Cost Deployment Plan (500 Concurrent Users)

## Goal: Get Running for < $20/month

**Target**: 500 concurrent users  
**Budget**: < $20/month  
**Strategy**: Start minimal, scale when revenue comes in

---

## ✅ **Frontend: Cloudflare Pages** (FREE)

- **Cost**: $0/month
- **Bandwidth**: Unlimited
- **CDN**: Global edge network
- **Setup**: 15 minutes

**Already locked in - no changes needed!**

---

## 💰 **Backend: Minimal Cost Options**

### **Option 1: Single EC2 + Upstash Redis** ⭐ **BEST VALUE**

#### Architecture:
```
Internet
   │
   ▼
Single EC2 Instance (t3.medium)
   │
   ▼
Upstash Redis (Free/Paid)
   │
   ▼
Supabase (Free/Pro)
```

#### Setup:
1. **EC2 Instance**:
   - **Type**: `t3.medium` (2 vCPU, 4GB RAM)
   - **OS**: Ubuntu 22.04 LTS
   - **Storage**: 20GB EBS
   - **No Load Balancer** (initially) - Use EC2 public IP directly
   - **Auto-restart**: Use PM2 or systemd

2. **Upstash Redis**:
   - **Free Tier**: 10K commands/day (might be enough initially)
   - **Paid**: $0.20 per 100K commands (~$5-10/month if you exceed free tier)
   - **Global**: Accessible from anywhere (no VPC setup needed)

3. **Security**:
   - **Security Group**: Allow port 3001 from anywhere (0.0.0.0/0)
   - **SSL**: Use Let's Encrypt (free) with Nginx reverse proxy
   - **Firewall**: UFW on Ubuntu

#### Cost Breakdown:
- **EC2 t3.medium**: ~$30/month (but use AWS Free Tier for first 12 months!)
- **Upstash Redis**: $0-10/month (free tier first, then pay-as-you-go)
- **Data Transfer**: ~$5/month (first 100GB free)
- **Total**: **$0-15/month** (first year), **$35-45/month** (after free tier)

#### AWS Free Tier (First 12 Months):
- **EC2 t2.micro**: 750 hours/month FREE
- **EBS**: 30GB FREE
- **Data Transfer**: 100GB FREE

**For first year**: Use `t2.micro` (1 vCPU, 1GB RAM) - might handle 200-300 concurrent users, then upgrade to `t3.medium` when needed.

**Cost First Year**: **$0-10/month**  
**Cost After Year 1**: **$35-45/month**

---

### **Option 2: Railway Starter Plan** ⭐ **EASIEST**

#### Architecture:
```
Internet
   │
   ▼
Railway (Managed Backend)
   │
   ▼
Upstash Redis (Free/Paid)
   │
   ▼
Supabase
```

#### Setup:
- **Railway**: $5/month starter plan
  - 512MB RAM, 1 vCPU
  - 100GB bandwidth/month
  - Auto-deploy from GitHub
- **Upstash Redis**: Free tier or $5-10/month

#### Cost Breakdown:
- **Railway**: $5/month
- **Upstash Redis**: $0-10/month
- **Total**: **$5-15/month**

**Limitation**: 512MB RAM might struggle with 500 concurrent users. Railway auto-scales, but might need to upgrade to $20/month plan.

---

### **Option 3: Render Free Tier + Upstash** ⭐ **FREE INITIALLY**

#### Architecture:
Similar to Railway, but free tier available

#### Setup:
- **Render**: Free tier
  - 512MB RAM
  - Spins down after 15min inactivity (wakes on request)
  - 750 hours/month free
- **Upstash Redis**: Free tier

#### Cost Breakdown:
- **Render**: $0/month (free tier)
- **Upstash Redis**: $0/month (free tier)
- **Total**: **$0/month** (initially)

**Limitations**:
- ⚠️ Cold starts (15-30s wake time after inactivity)
- ⚠️ 512MB RAM might not handle 500 concurrent users
- ⚠️ Need to upgrade to paid plan ($7/month) for production

**Good for**: Testing, staging, low traffic  
**Not ideal for**: 500 concurrent users (need paid plan)

---

### **Option 4: DigitalOcean Droplet** ⭐ **CHEAP VPS**

#### Architecture:
```
Internet
   │
   ▼
DigitalOcean Droplet ($6/month)
   │
   ▼
Upstash Redis (Free/Paid)
```

#### Setup:
- **Droplet**: $6/month
  - 1 vCPU, 1GB RAM, 25GB SSD
  - Ubuntu 22.04
  - Can upgrade to $12/month (2 vCPU, 2GB RAM) if needed
- **Upstash Redis**: Free tier or $5-10/month

#### Cost Breakdown:
- **Droplet**: $6/month (or $12/month for 2GB RAM)
- **Upstash Redis**: $0-10/month
- **Total**: **$6-16/month**

**Limitation**: 1GB RAM might struggle with 500 concurrent users. Need $12/month plan (2GB RAM) for better performance.

---

## 🎯 **RECOMMENDED: Option 1 (EC2 + Upstash)**

### **Why This is Best for 500 Concurrent Users:**

1. **Performance**: `t3.medium` (2 vCPU, 4GB RAM) can handle 500 concurrent users
2. **Cost**: Free for first 12 months (AWS Free Tier), then $30/month
3. **Scalability**: Easy to add load balancer + more instances later
4. **Control**: Full control over server configuration

### **Setup Steps:**

#### **Step 1: Launch EC2 Instance (Free Tier)**

1. **AWS Console** → EC2 → Launch Instance
2. **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
3. **Instance Type**: `t2.micro` (Free Tier) or `t3.medium` ($30/month)
4. **Storage**: 20GB (Free Tier: 30GB free)
5. **Security Group**: 
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow Custom TCP (port 3001) from anywhere (for API)
6. **Key Pair**: Create/download .pem file

#### **Step 2: Setup Server**

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (for reverse proxy + SSL)
sudo apt install -y nginx

# Install Certbot (for Let's Encrypt SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### **Step 3: Deploy Backend**

```bash
# Clone your repo (or use GitHub Actions for auto-deploy)
git clone https://github.com/yourusername/luxe-threads.git
cd luxe-threads/backend

# Install dependencies
npm install

# Build
npm run build

# Create .env file
nano .env
```

**.env file**:
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-key
REDIS_URL=redis://your-upstash-endpoint:6379
JWT_SECRET=your-secret
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

#### **Step 4: Setup Upstash Redis**

1. **Sign up**: https://upstash.com (free account)
2. **Create Redis Database**: 
   - Name: `luxe-threads-prod`
   - Type: Regional (choose closest to your EC2 region)
   - TLS: Enabled
3. **Copy Connection String**: `redis://default:password@host:port`
4. **Add to .env**: `REDIS_URL=redis://...`

#### **Step 5: Start Backend with PM2**

```bash
# Start backend
pm2 start dist/index.js --name luxe-threads-backend

# Save PM2 config (auto-start on reboot)
pm2 save
pm2 startup  # Follow instructions

# Check status
pm2 status
pm2 logs luxe-threads-backend
```

#### **Step 6: Setup Nginx Reverse Proxy + SSL**

**Nginx Config** (`/etc/nginx/sites-available/luxe-threads`):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Or use EC2 public IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/luxe-threads /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL (if you have a domain)
sudo certbot --nginx -d api.yourdomain.com
```

#### **Step 7: Update Frontend API URL**

In Cloudflare Pages, set environment variable:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
# Or use EC2 public IP: http://your-ec2-ip:3001/api
```

---

## 📊 **Cost Comparison (500 Concurrent Users)**

| Option | Monthly Cost | Setup Time | Scalability |
|--------|-------------|------------|-------------|
| **EC2 t3.medium + Upstash** | $35-45 | 2-3 hours | ⭐⭐⭐⭐⭐ Excellent |
| **EC2 t2.micro (Free Tier) + Upstash** | $0-10 | 2-3 hours | ⭐⭐⭐ Good (200-300 users) |
| **Railway Starter + Upstash** | $5-15 | 30 min | ⭐⭐⭐ Good (might need upgrade) |
| **Render Free + Upstash** | $0-7 | 30 min | ⭐⭐ Limited (cold starts) |
| **DigitalOcean $6 + Upstash** | $6-16 | 2-3 hours | ⭐⭐⭐ Good (might need upgrade) |

---

## 🎯 **MY RECOMMENDATION**

### **Phase 1: Launch (Month 1-12) - $0-10/month**

**Use**: **EC2 t2.micro (Free Tier) + Upstash Redis Free Tier**

- **EC2**: Free for 12 months
- **Upstash**: Free tier (10K commands/day)
- **Total**: **$0/month** (if within free tier limits)

**Capacity**: 200-300 concurrent users comfortably

**When to upgrade**: 
- If you exceed 10K Redis commands/day → Upgrade Upstash to paid ($5-10/month)
- If traffic > 300 concurrent users → Upgrade EC2 to t3.medium ($30/month)

### **Phase 2: Growth (After Free Tier) - $35-45/month**

**Use**: **EC2 t3.medium + Upstash Redis Paid**

- **EC2**: $30/month
- **Upstash**: $5-10/month
- **Total**: **$35-45/month**

**Capacity**: 500+ concurrent users comfortably

### **Phase 3: Scale (When Revenue Comes) - $95-150/month**

**Add**:
- Load Balancer ($20/month)
- Second EC2 instance ($30/month)
- ElastiCache instead of Upstash ($15/month)
- **Total**: **$95-150/month**

**Capacity**: 1000+ concurrent users

---

## ⚡ **Performance Optimizations (Free)**

### **1. Enable Compression**
```typescript
// backend/src/index.ts
import compression from 'compression';
app.use(compression());
```

### **2. Add Rate Limiting**
```typescript
// backend/src/index.ts
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### **3. Optimize Redis Usage**
- Cache aggressively (6-hour TTL is good)
- Use Redis pipelining for bulk operations
- Monitor cache hit rate (aim for > 80%)

### **4. Database Connection Pooling**
- Supabase handles this, but verify connection limits
- Use connection pooling if needed

---

## 🔒 **Security (Free)**

### **1. Firewall (UFW)**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **2. SSL Certificate (Let's Encrypt)**
```bash
sudo certbot --nginx -d api.yourdomain.com
# Auto-renewal: Already configured
```

### **3. Keep System Updated**
```bash
# Add to crontab
0 2 * * * sudo apt update && sudo apt upgrade -y
```

---

## 📈 **Monitoring (Free Options)**

### **1. PM2 Monitoring**
```bash
pm2 monit  # Real-time monitoring
pm2 logs   # View logs
```

### **2. UptimeRobot** (Free)
- Monitor `/health` endpoint
- Email alerts on downtime
- **Cost**: Free (50 monitors)

### **3. Sentry** (Free Tier)
- Error tracking
- Performance monitoring
- **Cost**: Free (5K events/month)

### **4. AWS CloudWatch** (Free Tier)
- Basic metrics (CPU, memory, network)
- **Cost**: Free (first 10 metrics)

---

## 🚀 **Quick Start Checklist**

### **Week 1: Setup**
- [ ] Launch EC2 instance (t2.micro free tier)
- [ ] Setup Upstash Redis (free tier)
- [ ] Deploy backend to EC2
- [ ] Setup Nginx reverse proxy
- [ ] Configure SSL (Let's Encrypt)
- [ ] Update frontend API URL
- [ ] Test end-to-end

### **Week 2: Optimize**
- [ ] Add rate limiting
- [ ] Enable compression
- [ ] Setup monitoring (UptimeRobot, Sentry)
- [ ] Test with load (100-200 concurrent users)

### **Month 2-3: Monitor & Scale**
- [ ] Monitor Redis usage (upgrade if needed)
- [ ] Monitor EC2 performance (upgrade if needed)
- [ ] Add more optimizations as needed

---

## 💡 **Cost-Saving Tips**

1. **Use AWS Free Tier** (12 months free)
2. **Start with t2.micro**, upgrade only when needed
3. **Use Upstash free tier** initially
4. **No load balancer** initially (add when you have 2+ instances)
5. **Use Let's Encrypt** for SSL (free)
6. **Monitor usage** to avoid surprise bills
7. **Set up billing alerts** in AWS ($10, $20, $30 thresholds)

---

## 🎯 **Final Recommendation**

**Start with**: **EC2 t2.micro (Free Tier) + Upstash Redis Free Tier**

**Cost**: **$0/month** (first 12 months)

**Capacity**: 200-300 concurrent users

**Upgrade path**:
- Month 1-3: Monitor usage
- Month 4-6: If traffic grows → Upgrade to t3.medium ($30/month)
- Month 7-12: If revenue comes → Add load balancer + second instance

**Total cost first year**: **$0-50/month** (depending on traffic)

This gets you running for **practically free**, and you can scale as revenue comes in!
