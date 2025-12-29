/**
 * Application-wide constants
 */

export const TAX_RATE = 0.08; // 8% tax rate

export const CART_STORAGE_KEY = 'luxe-threads-cart';

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  ORDERS: '/api/orders',
  AUTH: '/api/auth',
} as const;

