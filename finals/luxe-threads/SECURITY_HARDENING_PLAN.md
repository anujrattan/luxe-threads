# Security Hardening Implementation Plan

## 🔒 Current Security Status

### ✅ **Already Implemented**
- ✅ JWT Authentication (with expiration)
- ✅ Password hashing (bcryptjs)
- ✅ CORS configuration
- ✅ Protected routes (admin/user)
- ✅ Input validation (basic)
- ✅ SQL injection protection (via Supabase parameterized queries)
- ✅ Error handling middleware
- ✅ Guest session validation (UUID format)

### ❌ **Missing Critical Security Features**

## 🎯 Security Hardening Requirements

### 1. **Rate Limiting** 🔴 CRITICAL

**Purpose**: Prevent brute force attacks, DDoS, and API abuse

**Implementation**:
- Install `express-rate-limit`
- Configure different limits for different endpoints:
  - **Auth endpoints** (login, signup): 5 requests per 15 minutes per IP
  - **API endpoints**: 100 requests per 15 minutes per IP
  - **Admin endpoints**: 50 requests per 15 minutes per IP
  - **Payment endpoints**: 10 requests per 15 minutes per IP
- Use Redis for distributed rate limiting (if multiple servers)
- Return proper error messages (429 Too Many Requests)

**Files to modify**:
- `backend/src/index.ts` - Add rate limiting middleware
- `backend/src/middleware/rateLimiter.ts` - Create rate limiter configs

---

### 2. **Security Headers (Helmet.js)** 🔴 CRITICAL

**Purpose**: Protect against common web vulnerabilities (XSS, clickjacking, etc.)

**Implementation**:
- Install `helmet`
- Configure security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or SAMEORIGIN if needed)
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (HSTS) - for HTTPS
  - `Content-Security-Policy` (CSP) - configure based on frontend needs
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` - restrict browser features

**Files to modify**:
- `backend/src/index.ts` - Add Helmet middleware

---

### 3. **Input Sanitization** 🔴 CRITICAL

**Purpose**: Prevent XSS attacks and malicious input

**Implementation**:
- Install `express-validator` or `validator` + `dompurify`
- Sanitize all user inputs:
  - Email addresses
  - Phone numbers
  - Text fields (names, addresses, descriptions)
  - URLs
  - JSON payloads
- Validate data types and formats
- Trim whitespace
- Escape special characters where needed

**Files to modify**:
- `backend/src/middleware/sanitize.ts` - Create sanitization middleware
- All route files - Add sanitization to request handlers

---

### 4. **CSRF Protection** 🟡 HIGH PRIORITY

**Purpose**: Prevent Cross-Site Request Forgery attacks

**Implementation**:
- Install `csurf` or use SameSite cookies
- Generate CSRF tokens for state-changing operations
- Validate CSRF tokens on POST/PUT/DELETE requests
- Use SameSite cookie attribute for session cookies

**Note**: Since we're using JWT in Authorization header (not cookies), CSRF is less critical, but still recommended for cookie-based auth if added later.

**Files to modify**:
- `backend/src/middleware/csrf.ts` - Create CSRF middleware
- `backend/src/index.ts` - Add CSRF protection

---

### 5. **HTTPS Enforcement** 🔴 CRITICAL (Production)

**Purpose**: Encrypt data in transit

**Implementation**:
- Configure Helmet HSTS header
- Redirect HTTP to HTTPS in production
- Use environment variable to detect production
- Ensure all API calls use HTTPS

**Files to modify**:
- `backend/src/index.ts` - Add HTTPS redirect middleware (production only)

---

### 6. **Request Size Limits** ✅ PARTIALLY DONE

**Current**: `express.json({ limit: "10mb" })` - Good
**Enhancement**: 
- Add per-route limits for specific endpoints
- Add request timeout middleware

---

### 7. **API Key/Secret Management** ⚠️ REVIEW NEEDED

**Current**: Environment variables
**Enhancement**:
- Ensure `.env` files are in `.gitignore`
- Use secure secret management (AWS Secrets Manager, etc.) in production
- Rotate secrets regularly
- Never log secrets in console

---

### 8. **Error Message Sanitization** ⚠️ PARTIAL

**Current**: Basic error handling
**Enhancement**:
- Don't expose stack traces in production
- Don't expose database errors directly
- Use generic error messages for users
- Log detailed errors server-side only

**Files to modify**:
- `backend/src/middleware/errorHandler.ts` - Enhance error handling

---

### 9. **Session Security** ✅ GOOD

**Current**: JWT with 30-minute expiration
**Enhancement**:
- Consider refresh tokens for longer sessions
- Implement token blacklisting on logout
- Add device fingerprinting (optional)

---

### 10. **Logging & Monitoring** ⚠️ BASIC

**Enhancement**:
- Log security events (failed logins, rate limit hits)
- Monitor for suspicious patterns
- Set up alerts for repeated failures
- Log all admin actions

---

## 📦 Required Packages

```bash
npm install express-rate-limit helmet express-validator
npm install --save-dev @types/express-rate-limit
```

**Optional** (for advanced features):
```bash
npm install csurf express-slow-down
npm install --save-dev @types/csurf
```

---

## 🚀 Implementation Priority

### **Phase 1: Critical (Do First)**
1. ✅ Rate Limiting
2. ✅ Security Headers (Helmet)
3. ✅ Input Sanitization
4. ✅ HTTPS Enforcement (production config)

### **Phase 2: High Priority**
5. ✅ CSRF Protection
6. ✅ Enhanced Error Handling
7. ✅ Request Timeout

### **Phase 3: Nice to Have**
8. ✅ Advanced Logging
9. ✅ Token Blacklisting
10. ✅ Device Fingerprinting

---

## 📝 Implementation Checklist

- [ ] Install security packages
- [ ] Configure rate limiting
- [ ] Add Helmet security headers
- [ ] Implement input sanitization
- [ ] Add CSRF protection
- [ ] Configure HTTPS enforcement
- [ ] Enhance error handling
- [ ] Add request timeouts
- [ ] Update environment variables
- [ ] Test all security features
- [ ] Document security configuration
- [ ] Security audit/review

---

## 🔍 Testing Checklist

- [ ] Test rate limiting (should block after limit)
- [ ] Test security headers (check response headers)
- [ ] Test input sanitization (XSS attempts)
- [ ] Test CSRF protection (if implemented)
- [ ] Test HTTPS redirect (production)
- [ ] Test error messages (no sensitive data exposed)
- [ ] Test authentication bypass attempts
- [ ] Test SQL injection attempts (should be blocked by Supabase)

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)

---

**Last Updated**: 2026-01-13
