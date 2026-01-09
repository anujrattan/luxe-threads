import React from 'react';
import { Card } from '../../../components/ui';
import { PackageIcon, TagIcon, BarChartIcon, ShoppingBagIcon } from '../../../components/icons';
import { AdminTab } from '../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    failed: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  totalCategories,
  totalProducts,
  totalOrders,
  ordersByStatus,
}) => {
  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="sticky top-8">
        {/* Vertical Navigation Tabs */}
        <Card className="p-2 bg-white dark:bg-brand-surface/50 backdrop-blur-sm border border-gray-200 dark:border-white/10">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => onTabChange('categories')}
              className={`px-4 py-3 font-semibold rounded-lg transition-all text-left ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <TagIcon className="w-5 h-5" />
                <span>Categories</span>
              </div>
            </button>
            <button
              onClick={() => onTabChange('products')}
              className={`px-4 py-3 font-semibold rounded-lg transition-all text-left ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageIcon className="w-5 h-5" />
                <span>Products</span>
              </div>
            </button>
            <button
              onClick={() => onTabChange('orders')}
              className={`px-4 py-3 font-semibold rounded-lg transition-all text-left ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Orders</span>
              </div>
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-4 py-3 font-semibold rounded-lg transition-all text-left ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-brand-secondary hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChartIcon className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </Card>

        {/* Stats Cards in Sidebar */}
        <div className="mt-6 space-y-4">
          {activeTab === 'categories' && (
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-secondary mb-1">Categories</p>
                  <p className="text-2xl font-bold text-brand-primary">{totalCategories}</p>
                </div>
                <TagIcon className="w-5 h-5 text-purple-400" />
              </div>
            </Card>
          )}
          
          {activeTab === 'products' && (
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-secondary mb-1">Products</p>
                  <p className="text-2xl font-bold text-brand-primary">{totalProducts}</p>
                </div>
                <PackageIcon className="w-5 h-5 text-blue-400" />
              </div>
            </Card>
          )}
          
          {activeTab === 'orders' && (
            <>
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-secondary mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-brand-primary">{totalOrders}</p>
                  </div>
                  <ShoppingBagIcon className="w-5 h-5 text-orange-400" />
                </div>
              </Card>
              
              {ordersByStatus.pending > 0 && (
                <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Pending</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.pending}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.processing > 0 && (
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Processing</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.processing}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.confirmed > 0 && (
                <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Confirmed</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.confirmed}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.shipped > 0 && (
                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Shipped</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.shipped}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.delivered > 0 && (
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Delivered</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.delivered}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.cancelled > 0 && (
                <Card className="p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Cancelled</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.cancelled}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  </div>
                </Card>
              )}
              
              {ordersByStatus.failed > 0 && (
                <Card className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-secondary mb-1">Failed</p>
                      <p className="text-2xl font-bold text-brand-primary">{ordersByStatus.failed}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === 'analytics' && (
            <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-secondary mb-1">Analytics</p>
                  <p className="text-sm text-brand-primary">
                    Use the main panel to explore trends and financials.
                  </p>
                </div>
                        <BarChartIcon className="w-5 h-5 text-indigo-400" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </aside>
  );
};

