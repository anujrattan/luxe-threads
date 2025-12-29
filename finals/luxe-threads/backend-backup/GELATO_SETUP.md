# Gelato Print-on-Demand Integration Setup

This guide explains how to set up and configure Gelato API integration for print-on-demand fulfillment.

## Prerequisites

1. **Gelato Account**: Sign up at [gelato.com](https://www.gelato.com)
2. **API Access**: Access to Gelato Dashboard → API Portal

## Setup Steps

### 1. Get Your Gelato Credentials

1. Log in to your [Gelato Dashboard](https://dashboard.gelato.com)
2. Navigate to **API Portal** or **Settings → API**
3. Generate a new **API Key**
4. Note your **Store ID** (if provided)

### 2. Configure Environment Variables

Add the following to your `.env` file in the `backend/` directory:

```env
# Gelato Print-on-Demand API Configuration
GELATO_API_KEY=your-api-key-here
GELATO_STORE_ID=your-store-id-here

# Gelato API Base URLs (different services use different domains and versions)
# Order API (v4) - for orders management
GELATO_ORDER_API_BASE_URL=https://order.gelatoapis.com/v4

# Product API (v3) - for product catalogs, templates, regions
GELATO_PRODUCT_API_BASE_URL=https://product.gelatoapis.com/v3

# Shipment API (v1) - for shipment methods
GELATO_SHIPMENT_API_BASE_URL=https://shipment.gelatoapis.com/v1

# Legacy: kept for backward compatibility (defaults to Order API)
# GELATO_API_BASE_URL=https://order.gelatoapis.com/v4

# Webhook Configuration
GELATO_WEBHOOK_SECRET=your-webhook-secret-here

# Ngrok (for local webhook development - optional)
NGROK_URL=https://abc123.ngrok-free.app
```

**Important Notes:**
- **Gelato uses different base URLs for different services:**
  - **Orders**: `https://order.gelatoapis.com/v4` (e.g., `/orders`)
  - **Products/Catalogs**: `https://product.gelatoapis.com/v3` (e.g., `/catalogs`)
  - **Shipments**: `https://shipment.gelatoapis.com/v1` (e.g., `/shipment-methods`)
- The service automatically selects the correct base URL based on the endpoint being called
- Base URLs already include the version prefix (v1, v3, v4), so endpoints should be added directly

**Required:**
- `GELATO_API_KEY` - Your API key from Gelato Dashboard (required)

**Optional (with defaults):**
- `GELATO_STORE_ID` - Your store identifier (if required by Gelato)
- `GELATO_ORDER_API_BASE_URL` - Order API base URL (defaults to `https://order.gelatoapis.com/v4`)
- `GELATO_PRODUCT_API_BASE_URL` - Product API base URL (defaults to `https://product.gelatoapis.com/v3`)
- `GELATO_SHIPMENT_API_BASE_URL` - Shipment API base URL (defaults to `https://shipment.gelatoapis.com/v1`)
- `GELATO_WEBHOOK_SECRET` - Secret for verifying webhook requests (for order status updates)

### 3. Test the Connection

Once configured, test the connection using the admin API:

```bash
# Make sure you're logged in as admin first
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/gelato/test
```

Or use the admin panel to test the connection.

## API Endpoints

All Gelato endpoints require admin authentication.

### Test Connection
```
GET /api/gelato/test
```
Tests the connection to Gelato API and returns account info.

### Product Catalog
```
GET /api/gelato/products
```
Retrieves available product templates (productUids) from Gelato.

### Search Products
```
GET /api/gelato/products/search?productUid=xxx&regionUid=xxx&search=xxx
```
Search for products by various criteria.

### Check Availability
```
GET /api/gelato/products/:productUid/availability?regionUid=xxx
```
Check if a product is available in a specific region.

### Get Regions
```
GET /api/gelato/regions
```
Get list of available shipping regions.

### Get Shipment Methods
```
GET /api/gelato/shipment-methods
```
Get available shipment methods (express, normal, etc.) from Gelato.

### Get Orders
```
GET /api/gelato/orders?limit=10&offset=0&status=xxx
```
Retrieve orders from Gelato with optional filters.

### Get Order Status
```
GET /api/gelato/orders/:orderReferenceId
```
Get status of a specific order by reference ID.

### Create Order
```
POST /api/gelato/orders
```
Create a new order in Gelato. Requires order data with:
- `customerReferenceId` - Your customer ID
- `orderReferenceId` - Your order ID (unique)
- `items` - Array of order items with productUid, quantity, and file URLs
- `shippingAddress` - Customer shipping address

## Webhook Setup

For local development, use ngrok to expose your webhook endpoint. See `NGROK_SETUP.md` for detailed instructions.

**Quick Setup:**
1. Install ngrok: `brew install ngrok` (or download from ngrok.com)
2. Start backend: `npm run dev`
3. Start ngrok: `ngrok http 3001`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Configure in Gelato Dashboard: `https://abc123.ngrok-free.app/api/gelato/webhooks`

## Next Steps

1. **Map Products**: Map your products to Gelato's product templates (productUids)
2. **Set Up Webhooks**: Configure webhooks for order status updates (see `NGROK_SETUP.md`)
3. **Test Order Flow**: Create a test order to verify end-to-end integration
4. **Handle Availability**: Implement availability checking before checkout

## Troubleshooting

### Error: "Gelato API key is not configured"
- Ensure `GELATO_API_KEY` is set in your `.env` file
- Restart your backend server after adding the key

### Error: "Failed to connect to Gelato API"
- Verify your API key is correct
- Check if Gelato's API is accessible from your server
- Review Gelato's API documentation for any changes

### Error: "Invalid productUid"
- Use the product catalog endpoint to get valid productUids
- Ensure you're using Gelato's template productUids, not your own product IDs

## Resources

- [Gelato API Documentation](https://dashboard.gelato.com/docs/)
- [Getting Started with API Integration](https://support.gelato.com/en/articles/8996572-getting-started-with-api-integration)
- [Gelato Support](https://support.gelato.com/)

