import { Product, Category } from '../types';
import { authService } from './auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Fallback mock data (for development/fallback)
let products: Product[] = [
  {
    id: '1',
    name: 'Classic Crewneck Tee',
    description: 'A timeless classic, this crewneck t-shirt is made from ultra-soft pima cotton for a comfortable fit and feel.',
    price: 35.00,
    originalPrice: 50.00,
    rating: 4.5,
    reviewCount: 182,
    tags: ['Best Seller', '100% organic cotton'],
    discount: 'Save $15',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=987&auto=format&fit=crop',
    category: 't-shirts',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'HeatherGray'] }
  },
  {
    id: '2',
    name: 'Custom Hoodie Pro',
    description: 'Premium quality hoodie with custom design options. Made from 100% organic cotton for ultimate comfort.',
    price: 89.99,
    originalPrice: 120.00,
    rating: 3.5,
    reviewCount: 234,
    tags: ['Customizable', '100% organic cotton'],
    discount: 'Save $30',
    imageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?q=80&w=1170&auto=format&fit=crop',
    category: 'hoodies',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['#374151', '#1e3a8a', '#15803d'] }
  },
  {
    id: '3',
    name: 'Signature Logo Mug',
    description: 'Start your day with our signature logo mug. This ceramic mug features a minimalist design and a comfortable handle.',
    price: 15.00,
    rating: 5,
    reviewCount: 98,
    tags: ['Top Gift'],
    imageUrl: 'https://images.unsplash.com/photo-1608979328229-db0085a23924?q=80&w=987&auto=format&fit=crop',
    category: 'mugs',
    variants: { sizes: ['11oz'], colors: ['White'] }
  },
  {
    id: '4',
    name: 'Abstract Lines Wall Art',
    description: 'Elevate your space with this modern abstract wall art. Printed on high-quality matte paper for a sophisticated look.',
    price: 50.00,
    originalPrice: 65.00,
    rating: 4,
    reviewCount: 45,
    tags: ['New Arrival'],
    discount: '15% Off',
    imageUrl: 'https://images.unsplash.com/photo-1549492423-400259a5cd31?q=80&w=1035&auto=format&fit=crop',
    category: 'wall-art',
    variants: { sizes: ['12x16', '18x24', '24x36'], colors: ['N/A'] }
  },
  {
    id: '5',
    name: 'Vintage Wash Tee',
    description: 'Get that perfectly worn-in feel from day one. Our vintage wash tee is specially treated for a soft, faded look.',
    price: 40.00,
    rating: 4.5,
    reviewCount: 112,
    tags: ['Customizable'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=880&auto=format&fit=crop',
    category: 't-shirts',
    variants: { sizes: ['S', 'M', 'L'], colors: ['#4b5563', '#60a5fa'] }
  },
  {
    id: '6',
    name: 'Zip-Up Tech Hoodie',
    description: 'The perfect hoodie for those on the go. Made from a moisture-wicking tech fabric, it\'s great for workouts or casual wear.',
    price: 95.00,
    originalPrice: 110.00,
    rating: 5,
    reviewCount: 78,
    tags: ['Performance'],
    discount: 'Limited Time',
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1000&auto=format&fit=crop',
    category: 'hoodies',
    variants: { sizes: ['M', 'L', 'XL'], colors: ['Black', 'Gray'] }
  },
  {
    id: '7',
    name: 'Minimalist Graphic Tee',
    description: 'Make a statement with simplicity. This tee features a clean, minimalist graphic on our signature soft cotton.',
    price: 38.00,
    rating: 4,
    reviewCount: 91,
    tags: ['100% organic cotton'],
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
    category: 't-shirts',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['White', '#f5f5dc'] }
  },
  {
    id: '8',
    name: 'Cozy Knit Beanie',
    description: 'A soft, comfortable beanie for chilly days. Made from a fine-knit acrylic blend for warmth without the itch.',
    price: 25.00,
    rating: 4.5,
    reviewCount: 150,
    tags: ['Best Seller'],
    imageUrl: 'https://images.unsplash.com/photo-1575428652377-a3d80e281e6e?q=80&w=987&auto=format&fit=crop',
    category: 'accessories',
    variants: { sizes: ['One Size'], colors: ['Black', '#eab308', '#166534'] }
  },
  {
    id: '9',
    name: 'Premium Cotton Sweatshirt',
    description: 'Ultra-soft premium cotton sweatshirt perfect for lounging or casual outings. Comfort meets style.',
    price: 65.00,
    originalPrice: 85.00,
    rating: 4.8,
    reviewCount: 203,
    tags: ['New Arrival', 'Best Seller'],
    discount: 'Save $20',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=987&auto=format&fit=crop',
    category: 'hoodies',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['#1f2937', '#3b82f6', '#059669'] }
  },
  {
    id: '10',
    name: 'Designer Print T-Shirt',
    description: 'Limited edition designer print tee featuring exclusive artwork. Stand out from the crowd.',
    price: 42.00,
    rating: 4.7,
    reviewCount: 89,
    tags: ['New Arrival'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=880&auto=format&fit=crop',
    category: 't-shirts',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', '#ef4444'] }
  }
];

const categories: Category[] = [
  { id: '1', name: 'T-Shirts', slug: 't-shirts', imageUrl: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=987&auto=format&fit=crop' },
  { id: '2', name: 'Hoodies', slug: 'hoodies', imageUrl: 'https://images.unsplash.com/photo-1606136214376-372e3a1a6f8b?q=80&w=987&auto=format&fit=crop' },
  { id: '3', name: 'Mugs', slug: 'mugs', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1037&auto=format&fit=crop' },
  { id: '4', name: 'Wall Art', slug: 'wall-art', imageUrl: 'https://images.unsplash.com/photo-1590945199859-676b6b7e8d2e?q=80&w=1015&auto=format&fit=crop' },
  { id: '5', name: 'Accessories', slug: 'accessories', imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=880&auto=format&fit=crop' },
  { id: '6', name: 'Jackets', slug: 'jackets', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1170&auto=format&fit=crop' },
  { id: '7', name: 'Pants', slug: 'pants', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1167&auto=format&fit=crop' },
  { id: '8', name: 'Shoes', slug: 'shoes', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1170&auto=format&fit=crop' }
];

const api = {
  // Authentication
  signup: async (email: string, password: string, name?: string): Promise<{ token: string; user: any }> => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async (): Promise<any> => {
    return apiCall('/auth/me');
  },

  // Products
  getProducts: async (categorySlug?: string): Promise<Product[]> => {
    try {
      const endpoint = categorySlug ? `/products?category=${categorySlug}` : '/products';
      return await apiCall(endpoint);
    } catch (error) {
      // Fallback to mock data if backend is unavailable
      console.warn('Backend unavailable, using mock data:', error);
      await new Promise(res => setTimeout(res, 300));
      if (categorySlug) {
        return products.filter(p => p.category === categorySlug);
      }
      return products;
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      return await apiCall(`/products/${id}`);
    } catch (error) {
      // Fallback to mock data
      console.warn('Backend unavailable, using mock data:', error);
      await new Promise(res => setTimeout(res, 300));
      return products.find(p => p.id === id);
    }
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    return apiCall(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Gelato
  getGelatoTemplate: async (templateId: string): Promise<any> => {
    return apiCall(`/gelato/templates/${templateId}`);
  },
  
  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      return await apiCall('/categories');
    } catch (error) {
      // Fallback to mock data
      console.warn('Backend unavailable, using mock data:', error);
      await new Promise(res => setTimeout(res, 300));
      return categories;
    }
  },

  // Get all categories including inactive (admin only)
  getAllCategoriesAdmin: async (): Promise<Category[]> => {
    return apiCall('/categories/admin/all');
  },

  // Toggle category active status (admin only)
  toggleCategoryActive: async (id: string): Promise<Category> => {
    return apiCall(`/categories/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },

  createCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
    return apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    return apiCall(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  submitOrder: async (orderDetails: any, gateway: 'COD' | 'Prepaid' = 'COD'): Promise<{ success: boolean; orderId?: string; orderNumber?: string; message?: string; razorpay?: any }> => {
    try {
      const { customer, items, total } = orderDetails;
      
      // Use firstName and lastName directly from form (now captured separately)
      const firstName = customer.firstName || customer.first_name || '';
      const lastName = customer.lastName || customer.last_name || '';
      
      // Fallback: if name field exists (for backward compatibility), split it
      const nameParts = (customer.name || '').trim().split(' ');
      const finalFirstName = firstName || nameParts[0] || '';
      const finalLastName = lastName || nameParts.slice(1).join(' ') || '';
      
      // Calculate amounts (all prices are tax-inclusive on the frontend)
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const shippingCost = 0; // TODO: Implement shipping cost calculation if needed
      // For new logic, we don't pre-compute tax on the frontend; backend/admin will reverse-calc GST.
      const taxAmount = 0;
      
      // Map cart items to line items format expected by backend
      const lineItems = items.map((item: any) => ({
        productId: item.id,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        price: item.price, // Unit price
      }));
      
      // Prepare order payload
      const orderPayload = {
        userEmail: customer.email,
        userName: `${finalFirstName} ${finalLastName}`.trim(), // Full name for display
        lineItems: lineItems,
        shippingAddress: {
          firstName: finalFirstName,
          lastName: finalLastName,
          email: customer.email,
          phone: customer.phone || '',
          address1: customer.address,
          address2: customer.address2 || '',
          city: customer.city,
          province: customer.state || '',
          zip: customer.zip,
          countryCode: 'IN', // Default to India
        },
        subtotal: subtotal,
        taxAmount: taxAmount,
        shippingCost: shippingCost,
        totalAmount: total,
        gateway: gateway,
      };
      
      const response = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });
      
      return {
        success: true,
        orderId: response.order?.id,
        orderNumber: response.order?.order_number,
        message: response.message || 'Order placed successfully',
        razorpay: response.razorpay || null,
      };
    } catch (error: any) {
      console.error('Error submitting order:', error);
      return {
        success: false,
        message: error.message || 'Failed to place order. Please try again.',
      };
    }
  },

  getBestSellers: async (limit?: number): Promise<Product[]> => {
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      return await apiCall(`/products/best-sellers${queryParams}`);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      // Fallback to mock data if API fails
      return products.filter(p => 
        p.tags?.includes('Best Seller') || 
        (p.reviewCount && p.reviewCount > 100)
      ).slice(0, limit || 8);
    }
  },

  getNewArrivals: async (limit?: number): Promise<Product[]> => {
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      return await apiCall(`/products/new-arrivals${queryParams}`);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      // Fallback to mock data if API fails
      return products.filter(p => 
        p.tags?.includes('New Arrival') || 
        ['4', '9', '10'].includes(p.id)
      ).slice(0, limit || 8);
    }
  },

      getSaleItems: async (): Promise<Product[]> => {
        await new Promise(res => setTimeout(res, 300));
        // Filter products with discount or originalPrice
        return products.filter(p => p.discount || p.originalPrice);
      },
      // Orders
      getOrders: async (status?: string, limit?: number, offset?: number): Promise<{ success: boolean; orders: any[]; total: number }> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        const queryString = params.toString();
        return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
      },

      getOrderByNumber: async (orderNumber: string, email?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        const queryString = params.toString();
        return apiCall(`/orders/${orderNumber}${queryString ? `?${queryString}` : ''}`);
      },

      lookupOrder: async (orderNumber: string, email: string): Promise<any> => {
        return apiCall('/orders/lookup', {
          method: 'POST',
          body: JSON.stringify({ orderNumber, email }),
        });
      },

      updateOrderStatus: async (orderNumber: string, status: string, notes?: string): Promise<any> => {
        return apiCall(`/orders/${orderNumber}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, notes }),
        });
      },

      updateOrderFulfillmentPartner: async (orderNumber: string, fulfillment_partner: string | null): Promise<any> => {
        return apiCall(`/orders/${orderNumber}/fulfillment-partner`, {
          method: 'PUT',
          body: JSON.stringify({ fulfillment_partner }),
        });
      },

      updateOrderPartnerOrderId: async (orderNumber: string, partner_order_id: string | null): Promise<any> => {
        return apiCall(`/orders/${orderNumber}/partner-order-id`, {
          method: 'PUT',
          body: JSON.stringify({ partner_order_id }),
        });
      },

      // Users
      getUserProfile: async (): Promise<any> => {
        return apiCall('/users/profile');
      },

      getUserOrders: async (): Promise<any> => {
        return apiCall('/users/orders');
      },

      createAddress: async (addressData: any): Promise<any> => {
        return apiCall('/users/addresses', {
          method: 'POST',
          body: JSON.stringify(addressData),
        });
      },

      updateAddress: async (addressId: string, addressData: any): Promise<any> => {
        return apiCall(`/users/addresses/${addressId}`, {
          method: 'PUT',
          body: JSON.stringify(addressData),
        });
      },

      deleteAddress: async (addressId: string): Promise<any> => {
        return apiCall(`/users/addresses/${addressId}`, {
          method: 'DELETE',
        });
      },

      setPrimaryAddress: async (addressId: string): Promise<any> => {
        return apiCall(`/users/addresses/${addressId}/set-primary`, {
          method: 'PUT',
        });
      },

      // Analytics (admin)
      getAnalyticsOverview: async (params: { from?: string; to?: string; granularity?: 'day' | 'week' | 'month' } = {}): Promise<any> => {
        const search = new URLSearchParams();
        if (params.from) search.append('from', params.from);
        if (params.to) search.append('to', params.to);
        if (params.granularity) search.append('granularity', params.granularity);
        const queryString = search.toString();
        return apiCall(`/analytics/overview${queryString ? `?${queryString}` : ''}`);
      },

      // Payments
      createRazorpayOrder: async (orderId: string, orderNumber: string, amount: number): Promise<any> => {
        return apiCall('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ orderId, orderNumber, amount }),
        });
      },

      verifyPayment: async (orderId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<any> => {
        return apiCall('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
          }),
        });
      },

  // Search products
  searchProducts: async (params: {
    q: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Product[]; total: number; query: string; page: number; limit: number }> => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return await apiCall(`/products/search?${queryString}`);
  },
};

export default api;

