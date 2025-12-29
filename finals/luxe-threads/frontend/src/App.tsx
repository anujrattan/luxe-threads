import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthPage } from "./pages/AuthPage";
import { AdminPage } from "./pages/AdminPage";
import { Button } from "./components/ui";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { BestSellersPage } from "./pages/BestSellersPage";
import { NewArrivalsPage } from "./pages/NewArrivalsPage";
import { SaleItemsPage } from "./pages/SaleItemsPage";
import { FAQPage } from "./pages/FAQPage";
import { ShippingPage } from "./pages/ShippingPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { SizeGuidePage } from "./pages/SizeGuidePage";
import { CustomDesignPage } from "./pages/CustomDesignPage";
import { useNavigate, useLocation } from "react-router-dom";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAdmin } = useApp();
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate("/auth");
    return null;
  }

  return <>{children}</>;
};

// Order Success Page Component
const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto text-center py-20 animate-fadeIn">
      <h1 className="text-3xl font-bold font-display text-brand-primary">
        Thank you for your order!
      </h1>
      <p className="mt-4 text-brand-secondary">
        You'll receive a confirmation email shortly.
      </p>
      <Button onClick={() => navigate("/")} className="mt-6">
        Back to Home
      </Button>
    </div>
  );
};

// App Layout Component
const AppLayout: React.FC = () => {
  const { cartItemCount, cartAnimationKey, isAdmin } = useApp();
  const location = useLocation();

  // Determine current page for header highlighting
  const currentPage = location.pathname.split("/")[1] || "home";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-bg">
      <Header
        cartItemCount={cartItemCount}
        currentPage={currentPage}
        cartAnimationKey={cartAnimationKey}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/best-sellers" element={<BestSellersPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/sale" element={<SaleItemsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/custom-design" element={<CustomDesignPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
