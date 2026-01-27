# Email Notifications & AI Chat Implementation Plan

## 📧 Email Notification System

### **1. Email Service Provider Options**

#### **Option A: Resend (Recommended) ⭐**
- **Why**: Modern, developer-friendly, great DX
- **Pricing**: Free tier (3,000 emails/month), then $20/month for 50k emails
- **Features**: 
  - React Email templates
  - Great API
  - Domain verification
  - Analytics & webhooks
- **Best for**: Modern apps, React-based projects

#### **Option B: SendGrid (Enterprise)**
- **Why**: Industry standard, reliable, feature-rich
- **Pricing**: Free tier (100 emails/day), then $19.95/month for 50k emails
- **Features**: 
  - Email templates
  - Marketing campaigns
  - Advanced analytics
  - Webhooks
- **Best for**: Large scale, marketing-heavy

#### **Option C: AWS SES (Cost-effective)**
- **Why**: Very cheap, scalable
- **Pricing**: $0.10 per 1,000 emails (after free tier)
- **Features**: 
  - Basic email sending
  - Requires more setup
  - Less developer-friendly
- **Best for**: High volume, cost-sensitive

#### **Option D: Mailgun**
- **Why**: Good balance of features and price
- **Pricing**: Free tier (5,000 emails/month), then $35/month for 50k emails
- **Features**: 
  - Good API
  - Templates
  - Analytics
- **Best for**: Mid-size businesses

**Recommendation**: **Resend** - Best developer experience, modern API, React Email support

---

### **2. Domain Email Setup**

#### **Step 1: Get Domain Email**
You have two options:

**Option A: Google Workspace (Professional)**
- **Cost**: $6/user/month
- **Features**: Gmail interface, 30GB storage, professional email
- **Setup**: Add MX records to domain
- **Email**: `support@yourdomain.com`, `orders@yourdomain.com`, etc.

**Option B: Zoho Mail (Free/Cheap)**
- **Cost**: Free for 5 users (5GB each), or $1/user/month for 30GB
- **Features**: Professional email, webmail, mobile apps
- **Setup**: Add MX records to domain
- **Email**: `support@yourdomain.com`, `orders@yourdomain.com`, etc.

**Option C: Microsoft 365**
- **Cost**: $6/user/month
- **Features**: Outlook, Office apps, 50GB storage
- **Setup**: Add MX records to domain

**Recommendation**: **Zoho Mail (Free)** - Best value, professional, easy setup

#### **Step 2: Email Addresses to Create**
- `support@yourdomain.com` - Customer support
- `orders@yourdomain.com` - Order notifications (no-reply)
- `noreply@yourdomain.com` - Automated emails
- `marketing@yourdomain.com` - Marketing campaigns
- `admin@yourdomain.com` - Admin notifications

---

### **3. Email Notification Types**

#### **A. Order Notifications**

**1. Order Confirmation (Customer)**
- **Trigger**: Order placed successfully
- **Recipient**: Customer email
- **Content**: 
  - Order number
  - Order items with images
  - Shipping address
  - Payment method
  - Total amount
  - Estimated delivery date
  - Track order link

**2. Order Confirmation (Admin)**
- **Trigger**: New order created
- **Recipient**: Admin email
- **Content**: 
  - Order number
  - Customer details
  - Order items
  - Total amount
  - Payment status
  - Admin dashboard link

**3. Order Status Updates**
- **Trigger**: Order status changes (confirmed, processing, shipped, delivered, cancelled)
- **Recipient**: Customer email
- **Content**: 
  - Order number
  - New status
  - Status-specific message
  - Tracking number (if shipped)
  - Expected delivery date
  - Track order link

**4. Payment Confirmation**
- **Trigger**: Payment successful
- **Recipient**: Customer email
- **Content**: 
  - Order number
  - Payment amount
  - Payment method
  - Transaction ID
  - Receipt link

**5. Payment Failed**
- **Trigger**: Payment failure
- **Recipient**: Customer email
- **Content**: 
  - Order number
  - Failure reason
  - Retry payment link
  - Support contact

#### **B. Inventory Notifications**

**6. Out of Stock Alert (Admin)**
- **Trigger**: Product stock reaches 0
- **Recipient**: Admin email
- **Content**: 
  - Product name
  - Product ID
  - Current stock: 0
  - Last sold date
  - Admin product link

**7. Low Stock Alert (Admin)**
- **Trigger**: Product stock < threshold (e.g., 10)
- **Recipient**: Admin email
- **Content**: 
  - Product name
  - Current stock
  - Threshold
  - Admin product link

**8. Back in Stock (Customer)**
- **Trigger**: Product stock > 0 (was 0)
- **Recipient**: Customers who wishlisted/notified
- **Content**: 
  - Product name
  - Product image
  - Product link
  - "Shop Now" CTA

#### **C. Marketing & Newsletter**

**9. Welcome Email**
- **Trigger**: New user signup
- **Recipient**: New user
- **Content**: 
  - Welcome message
  - Discount code (10% off)
  - Featured products
  - Social links

**10. Newsletter**
- **Trigger**: Scheduled (weekly/monthly)
- **Recipient**: Subscribed users
- **Content**: 
  - New arrivals
  - Best sellers
  - Special offers
  - Blog posts
  - Unsubscribe link

**11. Abandoned Cart**
- **Trigger**: Cart abandoned for 24 hours
- **Recipient**: Customer email
- **Content**: 
  - Cart items with images
  - Total amount
  - Discount code (5% off)
  - "Complete Purchase" CTA

**12. Price Drop Alert**
- **Trigger**: Product price decreases
- **Recipient**: Wishlist users
- **Content**: 
  - Product name
  - Old price vs new price
  - Discount percentage
  - Product link

---

### **4. Implementation Architecture**

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│   (Express)     │
└────────┬────────┘
         │
         ├─────────────────┐
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│   Database      │  │  Email Queue │
│   (Supabase)    │  │  (Redis/Bull) │
└─────────────────┘  └──────┬───────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Email Service│
                    │  (Resend)    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Customer      │
                    │  Email         │
                    └────────────────┘
```

---

### **5. Tools & Services Needed**

#### **Email Service**
- **Resend** (or SendGrid/Mailgun)
- **React Email** - For email templates
- **Bull Queue** (or similar) - For email queue management

#### **Domain Email**
- **Zoho Mail** (or Google Workspace)
- **Domain DNS access** - For MX records

#### **Backend**
- **Node.js email library** - `@react-email/components`, `resend`
- **Queue system** - `bull` or `bullmq` (Redis-based)
- **Template engine** - React Email

#### **Database**
- **Email logs table** - Track sent emails
- **Email preferences table** - User email preferences
- **Newsletter subscriptions table**

---

### **6. Implementation Steps**

#### **Phase 1: Setup (Week 1)**

**Step 1.1: Domain Email Setup**
1. Sign up for Zoho Mail (free)
2. Add domain to Zoho
3. Add MX records to domain DNS:
   ```
   mx.zoho.com (Priority: 10)
   mx2.zoho.com (Priority: 20)
   ```
4. Create email addresses:
   - `support@yourdomain.com`
   - `orders@yourdomain.com`
   - `noreply@yourdomain.com`

**Step 1.2: Email Service Setup**
1. Sign up for Resend
2. Add domain to Resend
3. Add DNS records (SPF, DKIM, DMARC):
   ```
   SPF: v=spf1 include:_spf.resend.com ~all
   DKIM: (provided by Resend)
   DMARC: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```
4. Verify domain
5. Get API key

**Step 1.3: Install Dependencies**
```bash
cd backend
npm install resend @react-email/components @react-email/render
npm install bullmq ioredis  # For email queue
```

#### **Phase 2: Database Setup (Week 1)**

**Step 2.1: Create Email Tables**
```sql
-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'order_confirmation', 'status_update', etc.
  status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB, -- Store order_id, user_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  order_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  stock_alerts BOOLEAN DEFAULT false,
  price_drops BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Newsletter subscriptions
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT, -- 'website', 'checkout', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock notifications (for back-in-stock alerts)
CREATE TABLE stock_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, email)
);
```

#### **Phase 3: Email Service Implementation (Week 2)**

**Step 3.1: Create Email Service**
```typescript
// backend/src/services/email.ts
import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resend.apiKey);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const result = await resend.emails.send({
      from: options.from || 'Tinge Clothing <orders@yourdomain.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 3.2: Create Email Templates**
```typescript
// backend/src/templates/emails/OrderConfirmation.tsx
import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components';

export const OrderConfirmationEmail = ({ orderNumber, items, total, shippingAddress }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Section>
          <Text>Thank you for your order!</Text>
          <Text>Order Number: {orderNumber}</Text>
          {/* Order items, address, etc. */}
          <Button href={`https://yourdomain.com/order-details/${orderNumber}`}>
            Track Order
          </Button>
        </Section>
      </Container>
    </Body>
  </Html>
);
```

**Step 3.3: Create Email Queue**
```typescript
// backend/src/services/emailQueue.ts
import { Queue, Worker } from 'bullmq';
import { sendEmail } from './email.js';
import { render } from '@react-email/render';

const emailQueue = new Queue('emails', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const queueEmail = async (emailType: string, data: any) => {
  await emailQueue.add(emailType, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

// Worker to process emails
const emailWorker = new Worker('emails', async (job) => {
  const { emailType, recipient, data } = job.data;
  
  // Render email template
  const html = await renderEmailTemplate(emailType, data);
  
  // Send email
  await sendEmail({
    to: recipient,
    subject: getEmailSubject(emailType, data),
    html,
  });
  
  // Log email
  await logEmail(recipient, emailType, 'sent', data);
});
```

#### **Phase 4: Integrate with Order Flow (Week 2)**

**Step 4.1: Add Email Triggers**
```typescript
// backend/src/routes/orders.ts
import { queueEmail } from '../services/emailQueue.js';

// After order creation
router.post('/', async (req, res) => {
  // ... create order ...
  
  // Queue customer confirmation email
  await queueEmail('order_confirmation_customer', {
    recipient: orderData.userEmail,
    data: { orderNumber, items, total, address },
  });
  
  // Queue admin notification
  await queueEmail('order_confirmation_admin', {
    recipient: 'admin@yourdomain.com',
    data: { orderNumber, customer, items, total },
  });
});

// On order status update
router.put('/:orderNumber/status', async (req, res) => {
  // ... update status ...
  
  // Queue status update email
  await queueEmail('order_status_update', {
    recipient: order.user_email,
    data: { orderNumber, newStatus, trackingNumber },
  });
});
```

#### **Phase 5: Inventory Notifications (Week 3)**

**Step 5.1: Stock Monitoring**
```typescript
// backend/src/services/inventory.ts
export const checkStockLevels = async () => {
  // Check for low stock
  const lowStockProducts = await getLowStockProducts(10);
  
  for (const product of lowStockProducts) {
    await queueEmail('low_stock_alert', {
      recipient: 'admin@yourdomain.com',
      data: { productName: product.title, currentStock: product.stock },
    });
  }
  
  // Check for out of stock
  const outOfStockProducts = await getOutOfStockProducts();
  
  for (const product of outOfStockProducts) {
    await queueEmail('out_of_stock_alert', {
      recipient: 'admin@yourdomain.com',
      data: { productName: product.title },
    });
  }
};

// When product restocked
export const handleRestock = async (productId: string) => {
  const product = await getProduct(productId);
  
  // Notify customers who want to be notified
  const notifications = await getStockNotifications(productId);
  
  for (const notification of notifications) {
    await queueEmail('back_in_stock', {
      recipient: notification.email,
      data: { productName: product.title, productId, productUrl: `...` },
    });
    
    // Mark as notified
    await markAsNotified(notification.id);
  }
};
```

---

## 💬 AI Chat Assistant Implementation

### **1. Chat Service Options**

#### **Option A: Custom AI Integration (Recommended) ⭐**
- **Tools**: OpenAI API, Anthropic Claude, or Google Gemini
- **Cost**: Pay per message (~$0.002 per message)
- **Features**: Full control, custom training, brand voice
- **Best for**: Customized experience

#### **Option B: Intercom**
- **Cost**: $74/month (Starter plan)
- **Features**: AI chat, live chat, help center
- **Best for**: Enterprise, support-heavy

#### **Option C: Zendesk Chat**
- **Cost**: $55/month
- **Features**: AI + human agents, ticketing
- **Best for**: Large support teams

#### **Option D: Tawk.to (Free)**
- **Cost**: Free
- **Features**: Basic chat, mobile app
- **Best for**: Budget-conscious

**Recommendation**: **Custom AI Integration** - Most flexible, cost-effective, brand-aligned

---

### **2. AI Chat Implementation**

#### **Step 1: Choose AI Provider**
- **OpenAI GPT-4** - Best quality, $0.03/1k tokens
- **Anthropic Claude** - Great for long context, $0.008/1k tokens
- **Google Gemini** - Good balance, $0.001/1k tokens

**Recommendation**: **OpenAI GPT-4** or **Claude** for quality

#### **Step 2: Chat Bubble Component**
```typescript
// frontend/src/components/ChatBubble.tsx
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all z-50 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-brand-surface rounded-lg shadow-2xl border border-white/10 z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-brand-primary">Chat with us</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Messages will go here */}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};
```

#### **Step 3: Backend Chat API**
```typescript
// backend/src/routes/chat.ts
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  
  // Get product context
  const products = await getProducts();
  const productContext = products.map(p => 
    `${p.title}: ${p.description} - ₹${p.price}`
  ).join('\n');
  
  // System prompt
  const systemPrompt = `You are a helpful customer service assistant for Tinge Clothing, an e-commerce store selling premium apparel.

Product Catalog:
${productContext}

You can help with:
- Product recommendations
- Order status
- Shipping information
- Returns and refunds
- General questions

Be friendly, helpful, and concise.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  });
  
  res.json({
    success: true,
    message: completion.choices[0].message.content,
  });
});
```

#### **Step 4: Chat Features**
- **Context awareness**: Product catalog, order history
- **Order lookup**: By order number
- **Product recommendations**: Based on query
- **FAQ answers**: Common questions
- **Escalation**: Transfer to human if needed

---

### **3. Tools & Services for Chat**

#### **AI Provider**
- **OpenAI API** - GPT-4
- **Anthropic Claude API** - Alternative
- **Google Gemini API** - Budget option

#### **Backend**
- **OpenAI SDK** - `openai` npm package
- **WebSocket** (optional) - For real-time chat
- **Redis** - For conversation history

#### **Frontend**
- **React component** - Chat bubble
- **WebSocket client** (optional) - Real-time updates

---

## 📋 Implementation Checklist

### **Email Notifications**
- [ ] Setup domain email (Zoho Mail)
- [ ] Setup email service (Resend)
- [ ] Configure DNS records (MX, SPF, DKIM, DMARC)
- [ ] Create database tables (email_logs, email_preferences, etc.)
- [ ] Install dependencies (resend, react-email, bullmq)
- [ ] Create email service wrapper
- [ ] Create email templates (React Email)
- [ ] Setup email queue (BullMQ)
- [ ] Integrate order confirmation emails
- [ ] Integrate order status update emails
- [ ] Setup inventory monitoring
- [ ] Create stock alert emails
- [ ] Create back-in-stock emails
- [ ] Setup newsletter system
- [ ] Create marketing email templates
- [ ] Add email preferences management
- [ ] Add unsubscribe functionality

### **AI Chat**
- [ ] Choose AI provider (OpenAI/Claude)
- [ ] Get API key
- [ ] Create chat bubble component
- [ ] Create chat window UI
- [ ] Create backend chat API
- [ ] Add product context to AI
- [ ] Add order lookup capability
- [ ] Add conversation history
- [ ] Add typing indicators
- [ ] Add file upload (optional)
- [ ] Add human escalation (optional)

---

## 💰 Cost Estimation

### **Email Service (Resend)**
- Free tier: 3,000 emails/month
- Paid: $20/month for 50k emails
- **Estimated**: $20-40/month

### **Domain Email (Zoho)**
- Free: 5 users, 5GB each
- **Estimated**: $0/month (free tier)

### **AI Chat (OpenAI)**
- GPT-4: ~$0.03 per 1k tokens
- Average chat: ~500 tokens
- 1,000 chats/month = ~$15
- **Estimated**: $15-30/month

### **Total Monthly Cost**: ~$35-70/month

---

## 🚀 Quick Start (Priority Order)

### **Week 1: Email Foundation**
1. Setup Zoho Mail + domain email
2. Setup Resend + DNS records
3. Create database tables
4. Install dependencies
5. Create basic email service

### **Week 2: Order Emails**
1. Create order confirmation template
2. Create order status update template
3. Integrate with order flow
4. Test email sending

### **Week 3: Inventory & Marketing**
1. Setup stock monitoring
2. Create stock alert emails
3. Create newsletter system
4. Create marketing templates

### **Week 4: AI Chat**
1. Setup OpenAI account
2. Create chat bubble component
3. Create chat API
4. Add product context
5. Test and deploy

---

## 📝 Next Steps

1. **Choose email service**: Resend (recommended)
2. **Choose domain email**: Zoho Mail (free)
3. **Choose AI provider**: OpenAI GPT-4
4. **Get API keys**: Sign up for services
5. **Start implementation**: Follow checklist above

Would you like me to start implementing any of these features?
