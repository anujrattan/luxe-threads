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
import { CurrencyCode, getStoredCurrency, saveCurrencyPreference } from '../utils/currency';
import { isCategoryAllowed } from '../utils/cookieConsent';

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'luxe-threads-theme';

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
};

const saveThemePreference = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // Update document class for Tailwind dark mode
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    // Force a reflow to ensure CSS variables update
    void htmlElement.offsetHeight;
  }
};

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
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
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
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => getStoredCurrency());
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = getStoredTheme();
    // Initialize document class on mount - must happen synchronously
    if (typeof window !== 'undefined') {
      const htmlElement = document.documentElement;
      if (storedTheme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, storedTheme);
    }
    return storedTheme;
  });

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

  // Save currency preference when it changes
  useEffect(() => {
    saveCurrencyPreference(currency);
  }, [currency]);

  // Currency setter that updates both state and localStorage
  const setCurrency = React.useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    saveCurrencyPreference(newCurrency);
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only persist theme to localStorage if functional cookies are allowed
      if (isCategoryAllowed('functional')) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
      
      const htmlElement = document.documentElement;
      
      // Toggle dark class: dark theme = has class, light theme = no class
      if (theme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
      
      // Force a reflow to ensure CSS variables update
      void htmlElement.offsetHeight;
    }
  }, [theme]);

  // Theme setter that updates both state and localStorage
  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // Toggle theme helper - use functional update to avoid stale closure
  const toggleTheme = React.useCallback(() => {
    setThemeState((currentTheme) => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      return newTheme;
    });
  }, []);

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
        currency,
        setCurrency,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

