import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { Toaster } from "./components/Toaster";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentCallbackPage } from "./pages/PaymentCallbackPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthPage } from "./pages/AuthPage";
import { AdminPage } from "./pages/AdminPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { GuestOrderLookupPage } from "./pages/GuestOrderLookupPage";
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
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import { CookieConsent } from "./components/CookieConsent";
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderNumber = params.get("orderNumber");
  const gateway = params.get("gateway");
  const paymentStatus = params.get("paymentStatus");

  const getStatusMessage = () => {
    if (gateway === "COD") {
      return {
        title: "Order Placed Successfully!",
        message:
          "Your order has been confirmed. You will pay when you receive the order.",
      };
    }

    if (paymentStatus === "paid") {
      return {
        title: "Payment Successful!",
        message: "Your order has been confirmed and payment has been received.",
      };
    }

    if (paymentStatus === "failed") {
      return {
        title: "Payment Failed",
        message:
          "Your order has been created, but payment failed. Please contact support with your order number.",
      };
    }

    return {
      title: "Order Placed!",
      message:
        "Your order has been created. Payment status will be updated shortly.",
    };
  };

  const status = getStatusMessage();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fadeIn">
      <div className="max-w-2xl mx-auto bg-brand-surface p-8 rounded-lg shadow-sm border border-white/10">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${
            paymentStatus === "failed" ? "bg-red-500/20" : "bg-green-500/20"
          }`}
        >
          {paymentStatus === "failed" ? (
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <h1 className="text-3xl font-bold font-display text-brand-primary">
          {status.title}
        </h1>
        {orderNumber && (
          <p className="mt-4 text-lg text-brand-secondary">
            Order Number:{" "}
            <span className="font-semibold text-brand-primary">
              {orderNumber}
            </span>
          </p>
        )}
        <p className="mt-4 text-brand-secondary">{status.message}</p>
        {gateway === "Prepaid" && paymentStatus === "paid" && (
          <p className="mt-4 text-sm text-brand-secondary">
            You'll receive a confirmation email shortly.
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/")} className="px-6">
            Back to Home
          </Button>
          {orderNumber && (
            <Button
              onClick={() => navigate(`/order-details/${orderNumber}`)}
              variant="outline"
              className="px-6"
            >
              View Order Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// App Layout Component
const AppLayout: React.FC = () => {
  const { cartItemCount, cartAnimationKey, isAdmin } = useApp();
  const { toasts, removeToast } = useToast();
  const location = useLocation();

  // Determine current page for header highlighting
  const currentPage = location.pathname.split("/")[1] || "home";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-bg">
      <Toaster toasts={toasts} onClose={removeToast} />
      <CookieConsent />
      <Header
        cartItemCount={cartItemCount}
        currentPage={currentPage}
        cartAnimationKey={cartAnimationKey}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
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
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/order-details/:orderNumber"
            element={<OrderDetailsPage />}
          />
          <Route
            path="/guest-order-lookup"
            element={<GuestOrderLookupPage />}
          />
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
        <CookieConsentProvider>
          <ToastProvider>
            <ScrollToTop />
            <AppLayout />
          </ToastProvider>
        </CookieConsentProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
