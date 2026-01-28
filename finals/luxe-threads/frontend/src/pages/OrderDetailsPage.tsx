import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui';
import { RateProductModal } from '../components/RateProductModal';
import { StarRating } from '../components/StarRating';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export const OrderDetailsPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError('Order number is required');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const email = searchParams.get('email'); // For guest lookup
        
        let response;
        if (isAuthenticated) {
          response = await api.getOrderByNumber(orderNumber);
        } else if (email) {
          response = await api.getOrderByNumber(orderNumber, email);
        } else {
          setError('Please log in or provide your email');
          setLoading(false);
          return;
        }

        if (response.success && response.order) {
          setOrder(response.order);
          
          // Fetch product details for each item to get images
          const productIds = [...new Set(response.order.items.map((item: any) => item.product_id).filter(Boolean))];
          const productPromises = productIds.map((id: string) => api.getProductById(id));
          const productResults = await Promise.all(productPromises);
          
          const productsMap: Record<string, any> = {};
          productResults.forEach((product) => {
            if (product) {
              productsMap[product.id] = product;
            }
          });
          setProducts(productsMap);
          
          // Load user ratings for this order (authenticated or guest)
          try {
            const email = searchParams.get('email'); // For guest users
            const ratingsResponse = await api.getOrderRatings(orderNumber, email || undefined);
            if (ratingsResponse.success) {
              const ratingsMap: Record<string, number> = {};
              ratingsResponse.ratings.forEach((r: any) => {
                ratingsMap[r.product_id] = r.rating;
              });
              setUserRatings(ratingsMap);
            }
          } catch (err) {
            console.error('Failed to load ratings:', err);
          }
        } else {
          setError(response.message || 'Order not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber, isAuthenticated, searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    const email = !isAuthenticated ? searchParams.get('email') || undefined : undefined;
    try {
      await api.downloadInvoice(order.order_number, email);
    } catch (err: any) {
      alert(err.message || 'Failed to download invoice. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500 bg-green-500/10';
      case 'shipped':
        return 'text-blue-500 bg-blue-500/10';
      case 'confirmed':
      case 'processing':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-brand-secondary bg-brand-surface';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'refunded':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-brand-secondary bg-brand-surface';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-brand-secondary">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              ← Back
            </Button>
            <h1 className="text-3xl font-bold font-display text-brand-primary mb-2">
              Order #{order.order_number}
            </h1>
            <p className="text-brand-secondary">Placed on {formatDate(order.created_at)}</p>
          </div>
          {/* Download Invoice - visible only when order is delivered */}
          {order.status === 'delivered' && (
            <Button
              variant="secondary"
              onClick={handleDownloadInvoice}
              className="self-start md:self-auto"
            >
              Download Invoice (PDF)
            </Button>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-brand-surface rounded-lg border border-white/10 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-brand-secondary mb-1">Order Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-brand-secondary mb-1">Payment Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-brand-secondary mb-1">Payment Method</p>
              <p className="text-brand-primary font-medium">{order.gateway}</p>
            </div>
          </div>

          {/* Tracking Information - Show when order is shipped or delivered */}
          {(order.status === 'shipped' || order.status === 'delivered') && 
           (order.tracking_number || order.tracking_url || order.shipping_partner) && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-brand-primary mb-4">Tracking Information</h3>
              <div className="space-y-3">
                {order.shipping_partner && (
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Shipping Partner</p>
                    <p className="text-brand-primary font-medium">{order.shipping_partner}</p>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Tracking Number</p>
                    <p className="text-brand-primary font-mono font-medium">{order.tracking_number}</p>
                  </div>
                )}
                {order.tracking_url && (
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Track Your Order</p>
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 underline font-medium inline-flex items-center gap-2"
                    >
                      View Tracking Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-brand-surface rounded-lg border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-brand-primary mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => {
              const product = products[item.product_id];
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-brand-surface border border-white/10">
                    {product?.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-secondary text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-primary mb-1">{item.product_name}</h3>
                    <div className="text-sm text-brand-secondary space-y-1">
                      {item.size && <p>Size: {item.size}</p>}
                      {item.color && <p>Color: {item.color}</p>}
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="font-semibold text-brand-primary">{formatPrice(item.total_price)}</p>
                      <p className="text-sm text-brand-secondary">{formatPrice(item.unit_price)} each</p>
                    </div>
                    
                    {/* Rating Button (only for delivered orders) */}
                    {order.status === 'delivered' && item.product_id && (
                      <div className="mt-2">
                        {userRatings[item.product_id] ? (
                          <button
                            onClick={() => {
                              setSelectedProduct({ 
                                id: item.product_id, 
                                name: item.product_name,
                                imageUrl: product?.main_image_url || product?.imageUrl
                              });
                              setRatingModalOpen(true);
                            }}
                            className="flex flex-col items-end gap-1 text-xs hover:opacity-80 transition-opacity"
                          >
                            <span className="text-brand-secondary">Your rating:</span>
                            <StarRating rating={userRatings[item.product_id]} readonly size="sm" />
                          </button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedProduct({ 
                                id: item.product_id, 
                                name: item.product_name,
                                imageUrl: product?.main_image_url || product?.imageUrl
                              });
                              setRatingModalOpen(true);
                            }}
                            variant="outline"
                            className="text-xs py-1 px-3"
                          >
                            Rate Product
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Address */}
        {order.user && (
          <div className="bg-brand-surface rounded-lg border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-brand-primary mb-4">Shipping Address</h2>
            <div className="text-brand-secondary">
              <p className="font-medium text-brand-primary mb-1">
                {order.user.first_name} {order.user.last_name}
              </p>
              <p>{order.user.address1}</p>
              {order.user.address2 && <p>{order.user.address2}</p>}
              <p>
                {order.user.city}, {order.user.province} {order.user.zip}
              </p>
              <p>{order.user.country_code}</p>
              {order.user.phone && <p className="mt-2">Phone: {order.user.phone}</p>}
              <p className="mt-2">Email: {order.user.email}</p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {order.payment && (
          <div className="bg-brand-surface rounded-lg border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-brand-primary mb-4">Payment Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-secondary">Payment Method</span>
                <span className="text-brand-primary font-medium">
                  {order.payment.payment_method || order.gateway}
                </span>
              </div>
              {order.payment.razorpay_payment_id && (
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Transaction ID</span>
                  <span className="text-brand-primary font-mono text-xs">
                    {order.payment.razorpay_payment_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-secondary">Payment Status</span>
                <span className={`font-medium ${getPaymentStatusColor(order.payment.status).split(' ')[0]}`}>
                  {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-brand-surface rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-brand-primary mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-brand-secondary">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between text-brand-secondary">
                <span>Tax</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
            )}
            {order.shipping_cost > 0 && (
              <div className="flex justify-between text-brand-secondary">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-semibold text-brand-primary">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Product Modal */}
      {selectedProduct && (
        <RateProductModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productImageUrl={selectedProduct.imageUrl}
          orderNumber={orderNumber!}
          email={!isAuthenticated ? searchParams.get('email') || undefined : undefined}
          onSuccess={(rating) => {
            setUserRatings((prev) => ({ ...prev, [selectedProduct.id]: rating }));
            setRatingModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

