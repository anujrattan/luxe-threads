import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBagIcon, UserIcon, ChevronDownIcon, LogOutIcon, SettingsIcon, SunIcon, MoonIcon, XIcon } from './icons';
import { Category } from '../types';
import api from '../services/api';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  cartItemCount: number;
  currentPage: string;
  cartAnimationKey: number;
}

// Hamburger Icon Component
const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ cartItemCount, currentPage, cartAnimationKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout, theme, toggleTheme } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === '/';

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
    <>
      <header className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 pt-2 ${isHomePage ? 'bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-screen-xl flex items-center justify-between">
        {/* Logo - Always Left */}
        <Link 
          to="/"
          className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity py-2 pl-2"
        >
          <div className="h-16 sm:h-18 md:h-22 lg:h-24 w-24 sm:w-28 md:w-32 lg:w-36 overflow-visible flex items-center justify-center">
            <img 
              src={encodeURI("/Tinge Clothing - Logo - No background.png")} 
              alt="Tinge Clothing Logo" 
              className="h-full w-full object-contain object-center"
            />
          </div>
        </Link>

        {/* Navigation Container - Center */}
        <nav className="hidden md:flex items-center gap-1 w-fit mx-auto rounded-full bg-brand-surface px-6 py-2 backdrop-blur-lg border border-white/10 shadow-lg">
          {navItems.map(item => (
            <Link 
              key={item.name}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                isActive(item.path) ? 'text-yellow-400 dark:text-yellow-400 text-purple-600' : 'text-brand-secondary hover:text-brand-primary'
              }`}
            >
              {isActive(item.path) && (
                <span className="absolute inset-0 rounded-lg bg-yellow-400/20 dark:bg-yellow-400/20 bg-purple-100"></span>
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
                  ? 'text-yellow-400 dark:text-yellow-400 text-purple-600' 
                  : 'text-brand-secondary hover:text-brand-primary'
              }`}
              onClick={() => {
                if (!shopDropdownOpen) {
                  navigate('/categories');
                }
              }}
            >
              {(isActive('/categories') || location.pathname.startsWith('/category/')) && (
                <span className="absolute inset-0 rounded-lg bg-yellow-400/20 dark:bg-yellow-400/20 bg-purple-100"></span>
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
                      className="block px-4 py-2 text-sm text-brand-secondary hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border-l-2 border-transparent hover:border-purple-500 transition-all duration-200"
                    >
                      All Products
                    </Link>
                    <div className="border-t border-white/10 my-1"></div>
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-secondary hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border-l-2 border-transparent hover:border-purple-500 transition-all duration-200"
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
          {/* Theme Switcher - Desktop Only */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleTheme();
            }}
            className={`hidden md:flex relative p-2 transition-colors rounded-full ${
              isHomePage 
                ? 'text-white hover:text-white/80 hover:bg-white/20' 
                : 'text-brand-secondary hover:text-brand-primary hover:bg-white/10 dark:hover:bg-white/10'
            }`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Cart Icon - Always Visible */}
          <button 
            onClick={() => navigate('/cart')} 
            className={`relative p-2 transition-colors rounded-full ${
              isHomePage 
                ? 'text-white hover:text-white/80 hover:bg-white/20' 
                : 'text-brand-secondary hover:text-brand-primary hover:bg-white/10 dark:hover:bg-white/10'
            }`}
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
          
          {/* User Menu or Sign In Button - Desktop Only */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full flex items-center gap-2 ${
                  isHomePage 
                    ? 'text-white hover:text-white/80 hover:bg-white/20' 
                    : 'text-brand-secondary hover:text-brand-primary hover:bg-white/10'
                }`}
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
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
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
                    <div className="border-t border-white/10 my-1"></div>
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
              className={`hidden md:flex px-4 py-2 text-sm font-medium transition-colors rounded-full items-center gap-2 ${
                isHomePage 
                  ? 'text-white hover:text-white/80 hover:bg-white/20' 
                  : 'text-brand-secondary hover:text-brand-primary hover:bg-white/10'
              }`}
              aria-label="Sign in or Sign up"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomePage ? 'text-white hover:bg-white/20' : 'text-brand-secondary hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            <HamburgerIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Menu Dropdown - Outside header */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="fixed top-20 right-4 left-4 bg-white dark:bg-brand-surface border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] md:hidden overflow-hidden animate-dropdownIn max-h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
              <span className="text-lg font-display font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-brand-secondary" />
              </button>
            </div>

            {/* Scrollable Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : 'text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Shop Submenu */}
                <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10">
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-secondary">
                    Shop
                  </div>
                  <Link
                    to="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    All Products
                  </Link>
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* User Section (if logged in) */}
                {isAuthenticated && user && (
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-secondary">
                      Account
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full block px-4 py-3 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
            </nav>

            {/* Fixed Bottom Section - Settings */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-surface/50 p-4">
              <div className="space-y-2">
                {/* Theme Switcher */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleTheme();
                  }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-primary hover:bg-white dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  {theme === 'dark' ? (
                    <>
                      <SunIcon className="w-4 h-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-4 h-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Sign In Button (if not logged in) */}
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
