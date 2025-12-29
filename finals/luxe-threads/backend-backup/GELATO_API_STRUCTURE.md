# Gelato API Structure - Discovered Endpoints

## API Base URL

**Configured:** `https://order.gelatoapis.com/v4`  
**Actual Redirect:** `https://order.ie.live.gelato.tech/api/v4`

The base URL redirects internally, but you should always use `https://order.gelatoapis.com/v4` in your configuration.

## Working Endpoints

### ✅ `/orders` - **CONFIRMED WORKING**
- **URL:** `https://order.gelatoapis.com/v4/orders`
- **Method:** GET
- **Response:** `{"orders":[]}`
- **Status:** 200 OK
- **Use Case:** List all orders, test connection

### ❓ Product Catalog Endpoints (Need to verify)
The following endpoints returned 404, but might exist with different names:
- `/products` - ❌ Not found
- `/api/v4/products` - ❌ Not found  
- `/catalog` - ⏳ Not tested yet
- `/product-catalog` - ⏳ Not tested yet
- `/products/search` - ⏳ Not tested yet

## API Structure Pattern

```
Base URL: https://order.gelatoapis.com/v4
Endpoint Pattern: {baseUrl}/{endpoint}
Example: https://order.gelatoapis.com/v4/orders
```

**Important:** Don't add `/api/v4/` prefix - the base URL already handles versioning.

## Authentication

- **Header:** `X-API-KEY`
- **Value:** Your Gelato API key from dashboard
- **Status:** ✅ Working (confirmed by successful /orders call)

## Next Steps

1. **Test product catalog endpoints:**
   ```bash
   curl http://localhost:3001/api/gelato/products \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check Gelato API documentation** for:
   - Product catalog endpoint name
   - Product search endpoint
   - Order creation endpoint structure
   - File upload endpoints

3. **Common endpoints to try:**
   - `/catalog`
   - `/product-catalog`
   - `/products/search`
   - `/products/catalog`
   - `/catalog/products`

## Error Response Format

```json
{
  "code": "NOT_FOUND",
  "message": "No route found for \"GET https://order.ie.live.gelato.tech/api/v4/{endpoint}\"",
  "requestId": "...",
  "details": []
}
```

## Debugging Tips

1. Check server logs for `[Gelato API]` entries
2. Look for redirect URLs in error messages
3. Verify API key is being sent in `X-API-KEY` header
4. Test with `/orders` first to confirm authentication works

