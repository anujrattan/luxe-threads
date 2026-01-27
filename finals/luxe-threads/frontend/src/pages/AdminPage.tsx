import React, { useState, useEffect } from "react";
import { Product, Category } from "../types";
import api from "../services/api";
import { Card } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { AdminAnalyticsPage } from "./AdminAnalyticsPage";
import { ProductForm } from "./admin/components/ProductForm";
import { CategoryForm } from "./admin/components/CategoryForm";
import { AdminHeader } from "./admin/components/AdminHeader";
import { AdminSidebar } from "./admin/components/AdminSidebar";
import { CategoriesView } from "./admin/components/CategoriesView";
import { ProductsView } from "./admin/components/ProductsView";
import { OrdersView } from "./admin/components/OrdersView";
import { OrderDetailView } from "./admin/components/OrderDetailView";
import { useAdminData } from "./admin/hooks/useAdminData";
import { useAdminOrders } from "./admin/hooks/useAdminOrders";
import { AdminTab } from "./admin/types";
import { Modal } from "../components/Modal";
import { ArrowLeftIcon } from "../components/icons";

export const AdminPage: React.FC = () => {
  const { currency } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("categories");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [failedCategoryImages, setFailedCategoryImages] = useState<Set<string>>(
    new Set()
  );
  const [failedProductImages, setFailedProductImages] = useState<Set<string>>(
    new Set()
  );

  // Use custom hooks for data management
  const {
    products,
    categories,
    productsLoading,
    categoriesLoading,
    refetchAll,
  } = useAdminData();

  const {
    orders,
    selectedOrder,
    orderProducts,
    ordersLoading,
    isSaving,
    fetchOrders,
    selectOrder,
    clearSelection,
    saveOrderChanges,
  } = useAdminOrders();

  // Refetch data when switching tabs
  useEffect(() => {
    if (activeTab === "products" && !productsLoading) {
      refetchAll();
    } else if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await api.deleteProduct(id);
      await refetchAll();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setShowForm(false);
    setShowCategoryModal(false);
    setEditingProduct(null);
    setEditingCategory(null);
    await refetchAll();
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowCategoryModal(false);
    setEditingProduct(null);
    setEditingCategory(null);
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await api.deleteCategory(id);
      await refetchAll();
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategoryAddNew = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  // Calculate stats
  const totalCategories = categories.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;

  // Calculate order stats by status
  const ordersByStatus = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-brand-bg dark:via-brand-bg dark:to-purple-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Full Width Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-3 text-brand-primary dark:bg-gradient-to-r dark:from-purple-400 dark:via-pink-500 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
            Admin Console
          </h1>
          <p className="text-lg md:text-xl text-brand-secondary font-medium mb-4">
            Manage your store's categories and products
          </p>
          {/* Back Button - Only show when in form view */}
          {showForm && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-brand-primary bg-white dark:bg-brand-surface border-2 border-purple-500 dark:border-purple-400 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20 hover:border-purple-600 dark:hover:border-purple-300 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Go back to products list"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Products</span>
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          {!showForm && (
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalCategories={totalCategories}
              totalProducts={totalProducts}
              totalOrders={totalOrders}
              ordersByStatus={ordersByStatus}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {showForm ? (
              // Product Form View (still full screen for now)
              <ProductForm
                product={editingProduct}
                onSave={handleSave}
                onCancel={handleCancel}
                categories={categories}
              />
            ) : (
              <>
                {/* Header Section */}
                <AdminHeader
                  activeTab={activeTab}
                  onAddNew={
                    activeTab === "products"
                      ? handleAddNew
                      : handleCategoryAddNew
                  }
                />

                {/* Content Views */}
                {activeTab === "categories" ? (
                  <CategoriesView
                    categories={categories}
                    loading={categoriesLoading}
                    failedCategoryImages={failedCategoryImages}
                    onImageError={(id) =>
                      setFailedCategoryImages((prev) => new Set(prev).add(id))
                    }
                    onEdit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                    onAddNew={handleCategoryAddNew}
                  />
                ) : activeTab === "products" ? (
                  <ProductsView
                    products={products}
                    categories={categories}
                    loading={productsLoading}
                    currency={currency}
                    failedProductImages={failedProductImages}
                    onImageError={(id) =>
                      setFailedProductImages((prev) => new Set(prev).add(id))
                    }
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddNew={handleAddNew}
                  />
                ) : activeTab === "analytics" ? (
                  <div className="space-y-6">
                    <AdminAnalyticsPage />
                  </div>
                ) : activeTab === "orders" ? (
                  selectedOrder ? (
                    <OrderDetailView
                      order={selectedOrder}
                      orderProducts={orderProducts}
                      currency={currency}
                      onClose={clearSelection}
                      onSave={saveOrderChanges}
                      isSaving={isSaving}
                    />
                  ) : (
                    <OrdersView
                      orders={orders}
                      loading={ordersLoading}
                      currency={currency}
                      onSelectOrder={selectOrder}
                    />
                  )
                ) : null}
              </>
            )}
          </main>

          {/* Category Modal */}
          <Modal
            isOpen={showCategoryModal}
            onClose={handleCategoryModalClose}
            title={editingCategory ? "Edit Category" : "Add Category"}
            size="2xl"
          >
            <CategoryForm
              category={editingCategory}
              onSave={handleSave}
              onCancel={handleCategoryModalClose}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};
