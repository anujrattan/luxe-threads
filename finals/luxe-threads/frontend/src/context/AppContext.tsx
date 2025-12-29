/**
 * App Context
 * 
 * Provides shared state (cart, user auth) across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import { CART_STORAGE_KEY } from '../utils/constants';
import { authService } from '../services/auth';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

interface AppContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartAnimationKey: number;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [user, setUser] = useState<User | null>(null);
  const [cartAnimationKey, setCartAnimationKey] = useState(0);

  // Logout function (defined early for use in useEffect)
  const logout = React.useCallback(() => {
    authService.removeToken();
    setUser(null);
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired, clear it
          authService.removeToken();
          setUser(null);
        }
      }
    };
    loadUser();
  }, []);

  // Check token expiration every minute
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (user && authService.isTokenExpired()) {
        // Token expired, logout user
        logout();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, logout]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (itemToAdd: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === itemToAdd.id &&
        item.selectedColor === itemToAdd.selectedColor &&
        item.selectedSize === itemToAdd.selectedSize
      );
      if (existingItem) {
        return prevCart.map(item =>
          item.id === itemToAdd.id && item.selectedColor === itemToAdd.selectedColor && item.selectedSize === itemToAdd.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, itemToAdd];
    });
    setCartAnimationKey(prev => prev + 1);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart => prevCart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
        cartAnimationKey,
        user,
        isAuthenticated,
        isAdmin,
        setUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

