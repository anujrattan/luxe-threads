# Ngrok Setup for Gelato Webhooks

This guide explains how to set up ngrok to expose your local backend to the internet for Gelato webhook notifications.

## Why Ngrok?

- **Frontend ↔ Backend**: Communicate on `localhost:3001` (fast, no internet needed)
- **Gelato → Webhooks**: Send notifications via ngrok public URL (accessible from internet)
- **Development**: Test webhooks locally without deploying

## Setup Steps

### 1. Install Ngrok

**Option A: Download Binary**
1. Visit [ngrok.com/download](https://ngrok.com/download)
2. Download for your OS
3. Extract and add to PATH

**Option B: Using Package Manager**

```bash
# macOS
brew install ngrok

# npm (global)
npm install -g ngrok

# Windows (chocolatey)
choco install ngrok
```

### 2. Create Ngrok Account (Free)

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup)
2. Get your authtoken from the dashboard

### 3. Authenticate Ngrok

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 4. Start Your Backend Server

```bash
cd backend
npm run dev
```

Your backend should be running on `http://localhost:3001`

### 5. Start Ngrok Tunnel

In a **separate terminal**, run:

```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 6. Configure Gelato Webhook

1. Log in to [Gelato Dashboard](https://dashboard.gelato.com)
2. Go to **Settings → Webhooks** or **API → Webhooks**
3. Add webhook URL: `https://abc123.ngrok-free.app/api/gelato/webhooks`
4. Select events you want to receive:
   - Order created
   - Order status changed
   - Order shipped
   - Order failed
5. Save the webhook configuration

### 7. Update Environment Variables

Add to your `backend/.env`:

```env
# Ngrok Configuration (for webhook development)
NGROK_URL=https://abc123.ngrok-free.app
```

**Note**: This URL changes every time you restart ngrok (free plan). For production, use a fixed domain or ngrok's paid plan.

## Testing Webhooks

### Test Webhook Endpoint

```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/api/gelato/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.status_changed",
    "data": {
      "orderReferenceId": "test-123",
      "status": "processing"
    }
  }'
```

### Monitor Webhook Requests

1. **Ngrok Web Interface**: Visit `http://localhost:4040` to see all requests
2. **Backend Logs**: Check your server console for webhook logs
3. **Gelato Dashboard**: Check webhook delivery status

## Production Setup

For production, you have better options:

### Option 1: Deploy Backend
- Deploy your backend to a cloud service (Heroku, Railway, AWS, etc.)
- Use the production URL directly for webhooks
- No ngrok needed

### Option 2: Ngrok Static Domain (Paid)
- Upgrade to ngrok paid plan
- Get a static domain: `https://your-app.ngrok.app`
- Use this URL in Gelato webhook configuration

### Option 3: Reverse Proxy
- Use a reverse proxy (nginx, Caddy) with SSL
- Point your domain to your server
- Use your domain for webhooks

## Troubleshooting

### Webhook Not Receiving Requests

1. **Check ngrok is running**: `ngrok http 3001`
2. **Verify URL**: Make sure Gelato webhook URL matches your ngrok URL
3. **Check firewall**: Ensure port 3001 is accessible locally
4. **View ngrok inspector**: Visit `http://localhost:4040` to see incoming requests

### Signature Verification Failing

1. **Check webhook secret**: Ensure `GELATO_WEBHOOK_SECRET` matches Gelato's secret
2. **Raw body**: Make sure webhook endpoint uses raw body for signature verification
3. **Header name**: Verify Gelato sends signature in expected header

### Ngrok URL Changes

- **Free plan**: URL changes on restart
- **Solution**: Update Gelato webhook URL each time, or use paid plan for static domain

## Quick Start Script

Create `scripts/start-dev-with-ngrok.sh`:

```bash
#!/bin/bash

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start ngrok
echo "Starting ngrok..."
ngrok http 3001

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
```

Make it executable:
```bash
chmod +x scripts/start-dev-with-ngrok.sh
```

Run:
```bash
./scripts/start-dev-with-ngrok.sh
```

## Environment Variables Summary

```env
# Gelato API
GELATO_API_KEY=your-api-key
GELATO_STORE_ID=your-store-id
GELATO_API_BASE_URL=https://order.gelatoapis.com/v4
GELATO_WEBHOOK_SECRET=your-webhook-secret

# Ngrok (development only)
NGROK_URL=https://abc123.ngrok-free.app
```

## Resources

- [Ngrok Documentation](https://ngrok.com/docs)
- [Ngrok Dashboard](https://dashboard.ngrok.com)
- [Gelato Webhook Documentation](https://dashboard.gelato.com/docs/webhooks)

