import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBagIcon, StarIcon, UserIcon, ChevronDownIcon, LogOutIcon, SettingsIcon } from './icons';
import { Category } from '../types';
import api from '../services/api';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  cartItemCount: number;
  currentPage: string;
  cartAnimationKey: number;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, currentPage, cartAnimationKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await api.getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.relative')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-2 z-50 w-full px-2">
      <div className="mx-auto max-w-screen-xl flex items-center justify-between">
        {/* Logo - Left Side */}
        <Link 
          to="/"
          className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            PODStore
          </span>
          <StarIcon className="w-5 h-5 text-yellow-400" />
        </Link>

        {/* Navigation Container - Center */}
        <nav className="hidden md:flex items-center gap-1 w-fit mx-auto rounded-full bg-brand-surface/70 px-6 py-3 backdrop-blur-lg border border-white/10 shadow-lg">
          {navItems.map(item => (
            <Link 
              key={item.name}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                isActive(item.path) ? 'text-brand-primary' : 'text-brand-secondary hover:text-brand-primary'
              }`}
            >
              {isActive(item.path) && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-20 blur-lg"></span>
              )}
              {isActive(item.path) && (
                <span className="absolute inset-0 rounded-lg bg-white/10"></span>
              )}
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
          
          {/* Shop Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShopDropdownOpen(true)}
            onMouseLeave={() => setShopDropdownOpen(false)}
          >
            <button
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1 ${
                isActive('/categories') || location.pathname.startsWith('/category/')
                  ? 'text-brand-primary' 
                  : 'text-brand-secondary hover:text-brand-primary'
              }`}
              onClick={() => {
                if (!shopDropdownOpen) {
                  navigate('/categories');
                }
              }}
            >
              {(isActive('/categories') || location.pathname.startsWith('/category/')) && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-20 blur-lg"></span>
              )}
              {(isActive('/categories') || location.pathname.startsWith('/category/')) && (
                <span className="absolute inset-0 rounded-lg bg-white/10"></span>
              )}
              <span className="relative z-10">Shop</span>
              <ChevronDownIcon className={`w-4 h-4 relative z-10 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {shopDropdownOpen && (
              <div className="absolute top-full left-0 -mt-1 pt-3 w-56 z-50">
                <div className="bg-brand-surface rounded-xl border border-white/10 shadow-xl overflow-hidden">
                  <div className="py-2">
                    <Link
                      to="/categories"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors"
                    >
                      All Products
                    </Link>
                    <div className="border-t border-white/10 my-1"></div>
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Actions - Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart Icon - First */}
          <button 
            onClick={() => navigate('/cart')} 
            className="relative p-2 text-brand-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-white/10"
            aria-label="Shopping cart"
          >
            <div key={cartAnimationKey} className={cartAnimationKey > 0 ? 'animate-cartBump' : ''}>
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] font-medium flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                {cartItemCount}
              </span>
            )}
          </button>
          
          {/* User Menu or Sign In Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="px-3 py-2 text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-white/10 flex items-center gap-2"
                aria-label="User menu"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name || user.email.split('@')[0]}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-brand-surface rounded-xl border border-white/10 shadow-xl overflow-hidden z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-brand-primary truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-brand-secondary truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-white/10 flex items-center gap-2"
              aria-label="Sign in or Sign up"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
