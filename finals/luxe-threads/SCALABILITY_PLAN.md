# Scalability & Performance Plan

## Current State Analysis

### Architecture Overview
- **Backend**: Express.js (Node.js) - Single instance
- **Database**: Supabase (PostgreSQL) - Managed service
- **Cache**: Redis - Single instance
- **Frontend**: React (Vite) - Static build
- **Deployment**: Not specified (assumed single server)

### Current Capacity Estimate

#### **Estimated Concurrent Users: 50-100**
- Single Express.js instance can handle ~100-200 concurrent connections
- With Redis caching: ~80-90% of requests served from cache
- Database bottleneck: Supabase connection limits (varies by plan)

#### **Request Rate: ~500-1000 requests/minute**
- Cached endpoints (products, categories): ~10ms response time
- Database queries: ~50-200ms response time
- Payment/Order creation: ~500-1000ms (external API calls)

#### **Bottlenecks Identified**
1. **Single Backend Instance**: No horizontal scaling
2. **No Rate Limiting**: Vulnerable to DDoS/abuse
3. **Database Connection Pool**: Limited by Supabase plan
4. **Redis Single Instance**: No replication/failover
5. **No CDN**: Static assets served from same server
6. **No Monitoring**: No visibility into performance metrics

---

## Scalability Plan

### Phase 1: Immediate Optimizations (0-1000 concurrent users)
**Goal**: Handle 500-1000 concurrent users efficiently

#### 1.1 Backend Optimizations
- [ ] **Add Rate Limiting**
  - Use `express-rate-limit` middleware
  - Public endpoints: 100 req/min per IP
  - Auth endpoints: 10 req/min per IP
  - Admin endpoints: 30 req/min per user

- [ ] **Enable Compression**
  - Add `compression` middleware
  - Gzip/Brotli for JSON responses

- [ ] **Connection Pooling**
  - Configure Supabase connection pool (if available)
  - Set max connections per instance

- [ ] **Request Timeout**
  - Set 30s timeout for all requests
  - Timeout for external API calls (Razorpay, Qikink)

#### 1.2 Caching Enhancements
- [ ] **Cache Headers**
  - Add ETag support for product/category lists
  - Cache-Control headers for static responses

- [ ] **Cache Warming**
  - Pre-populate cache on server start
  - Background job to refresh popular data

#### 1.3 Database Optimizations
- [ ] **Query Optimization**
  - Add database indexes (verify existing)
  - Use `EXPLAIN ANALYZE` for slow queries
  - Batch operations where possible

- [ ] **Read Replicas** (if Supabase supports)
  - Route read queries to replicas
  - Keep writes on primary

#### 1.4 Frontend Optimizations
- [ ] **CDN for Static Assets**
  - Deploy frontend to CDN (Cloudflare, Vercel, Netlify)
  - Cache static assets (images, JS, CSS)

- [ ] **Code Splitting**
  - Lazy load admin panel
  - Route-based code splitting

**Expected Capacity After Phase 1**: 500-1000 concurrent users

---

### Phase 2: Horizontal Scaling (1000-5000 concurrent users)
**Goal**: Scale horizontally to handle 2000-5000 concurrent users

#### 2.1 Load Balancing
- [ ] **Load Balancer Setup**
  - Use Nginx/HAProxy or cloud LB (AWS ALB, GCP LB)
  - Health checks for backend instances
  - Session affinity (sticky sessions) if needed

- [ ] **Multiple Backend Instances**
  - Deploy 2-3 backend instances
  - Use PM2 cluster mode or container orchestration
  - Auto-scaling based on CPU/memory

#### 2.2 Redis Scaling
- [ ] **Redis Cluster/Replication**
  - Redis Sentinel for high availability
  - Or managed Redis (AWS ElastiCache, Redis Cloud)
  - Read replicas for read-heavy operations

#### 2.3 Database Scaling
- [ ] **Supabase Upgrade**
  - Upgrade to Pro/Team plan for more connections
  - Enable connection pooling (PgBouncer)
  - Read replicas for analytics queries

#### 2.4 Monitoring & Observability
- [ ] **Application Monitoring**
  - Add APM (New Relic, Datadog, or Sentry)
  - Track response times, error rates
  - Database query performance monitoring

- [ ] **Logging**
  - Centralized logging (ELK stack, CloudWatch, or Loggly)
  - Structured logging with correlation IDs

**Expected Capacity After Phase 2**: 2000-5000 concurrent users

---

### Phase 3: Advanced Scaling (5000+ concurrent users)
**Goal**: Handle 10,000+ concurrent users with high availability

#### 3.1 Microservices Architecture (Optional)
- [ ] **Service Separation**
  - Product Service (read-heavy)
  - Order Service (write-heavy)
  - Payment Service (external API gateway)
  - User Service (auth/profile)

- [ ] **Message Queue**
  - RabbitMQ/Kafka for async operations
  - Order processing queue
  - Email notification queue

#### 3.2 Database Sharding (if needed)
- [ ] **Horizontal Partitioning**
  - Shard by user_id or order_id
  - Separate read/write databases

#### 3.3 Caching Strategy
- [ ] **Multi-Layer Caching**
  - L1: In-memory cache (Node.js)
  - L2: Redis (distributed cache)
  - L3: CDN (static assets)

- [ ] **Cache Invalidation Strategy**
  - Event-driven cache invalidation
  - TTL + manual invalidation

#### 3.4 Auto-Scaling
- [ ] **Container Orchestration**
  - Kubernetes or Docker Swarm
  - Auto-scale based on metrics (CPU, memory, request rate)
  - Horizontal Pod Autoscaler (HPA)

- [ ] **Serverless Functions**
  - Move lightweight operations to serverless (AWS Lambda, Vercel Functions)
  - Image processing, email sending

**Expected Capacity After Phase 3**: 10,000+ concurrent users

---

## Implementation Priority

### Critical (Do First)
1. ✅ **Rate Limiting** - Prevent abuse
2. ✅ **Compression** - Reduce bandwidth
3. ✅ **CDN for Frontend** - Offload static assets
4. ✅ **Monitoring** - Visibility into performance

### High Priority (Next)
5. **Load Balancer** - Enable horizontal scaling
6. **Multiple Backend Instances** - Scale out
7. **Redis High Availability** - Prevent cache failures
8. **Database Connection Pooling** - Optimize DB connections

### Medium Priority (When Needed)
9. **Query Optimization** - Improve slow queries
10. **Cache Warming** - Pre-populate cache
11. **Read Replicas** - Distribute read load

### Low Priority (Future)
12. **Microservices** - Only if monolith becomes bottleneck
13. **Database Sharding** - Only if single DB can't handle load
14. **Message Queue** - For async processing

---

## Performance Targets

### Response Times (P95)
- **Cached endpoints**: < 50ms
- **Database queries**: < 200ms
- **External API calls**: < 1000ms
- **Page load (frontend)**: < 2s

### Availability
- **Target**: 99.9% uptime (8.76 hours downtime/year)
- **Monitoring**: Uptime checks every 1 minute
- **Alerting**: Notify on > 1% error rate

### Throughput
- **Current**: ~500-1000 req/min
- **Phase 1**: ~2000-3000 req/min
- **Phase 2**: ~10,000-15,000 req/min
- **Phase 3**: ~50,000+ req/min

---

## Cost Considerations

### Current (Estimated)
- Supabase: Free/Pro plan ($0-25/month)
- Redis: Self-hosted or managed ($0-50/month)
- Hosting: Single server ($20-50/month)
- **Total**: ~$20-125/month

### Phase 1
- CDN: $0-20/month (Cloudflare free tier)
- Monitoring: $0-50/month (free tier available)
- **Total**: ~$20-195/month

### Phase 2
- Load Balancer: $20-50/month
- Multiple servers: $50-150/month
- Managed Redis: $50-100/month
- Supabase Pro: $25-100/month
- **Total**: ~$145-500/month

### Phase 3
- Kubernetes cluster: $200-500/month
- Multiple services: $300-800/month
- **Total**: ~$500-1300/month

---

## Monitoring Metrics to Track

### Application Metrics
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections
- Memory usage
- CPU usage

### Database Metrics
- Query execution time
- Connection pool usage
- Slow queries (> 1s)
- Cache hit rate

### Infrastructure Metrics
- Server CPU/memory
- Network bandwidth
- Disk I/O
- Redis memory usage

---

## Next Steps

1. **Immediate**: Implement rate limiting and compression
2. **Week 1**: Set up CDN and basic monitoring
3. **Week 2**: Deploy load balancer and multiple instances
4. **Week 3**: Optimize database queries and add indexes
5. **Ongoing**: Monitor metrics and scale based on actual usage

---

## Notes

- **Start Simple**: Don't over-engineer. Scale when you need to.
- **Measure First**: Use monitoring to identify actual bottlenecks
- **Cache Aggressively**: 80% of requests should hit cache
- **Database is Bottleneck**: Optimize queries before scaling infrastructure
- **Supabase Limits**: Check your Supabase plan limits (connections, storage, bandwidth)
