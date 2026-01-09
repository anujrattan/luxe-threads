import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';


const CheckoutForm: React.FC<{ 
  onSubmit: (data: any, paymentMethod: 'COD' | 'Prepaid') => void;
  paymentMethod: 'COD' | 'Prepaid';
  onPaymentMethodChange: (method: 'COD' | 'Prepaid') => void;
  initialData?: any;
}> = ({ onSubmit, paymentMethod, onPaymentMethodChange, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.first_name || '',
    lastName: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address1 || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    state: initialData?.province || '',
    zip: initialData?.zip || '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.first_name || '',
        lastName: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address1 || '',
        address2: initialData.address2 || '',
        city: initialData.city || '',
        state: initialData.province || '',
        zip: initialData.zip || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };
  
  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData, paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-brand-primary">Contact Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-brand-secondary">First Name</label>
            <Input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="mt-1" required/>
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-brand-secondary">Last Name</label>
            <Input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="mt-1" required/>
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-secondary">Email</label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1" required/>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-brand-secondary">Phone (Optional)</label>
            <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1"/>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium text-brand-primary">Shipping Address</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-brand-secondary">Address Line 1</label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1"/>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address2" className="block text-sm font-medium text-brand-secondary">Address Line 2 (Optional)</label>
            <Input type="text" name="address2" id="address2" value={formData.address2} onChange={handleChange} className="mt-1"/>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-brand-secondary">City</label>
            <Input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="mt-1"/>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-brand-secondary">State / Province</label>
            <Input type="text" name="state" id="state" value={formData.state} onChange={handleChange} className="mt-1"/>
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-brand-secondary">ZIP / Postal Code</label>
            <Input type="text" name="zip" id="zip" value={formData.zip} onChange={handleChange} className="mt-1"/>
            {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
          </div>
        </div>
      </div>
      
      {/* Payment Method Selection */}
      <div>
        <h2 className="text-lg font-medium text-brand-primary mb-4">Payment Method</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('COD')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'COD'
                ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                : 'border-white/20 bg-brand-surface hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-brand-primary">Cash on Delivery</h3>
                <p className="text-sm text-brand-secondary mt-1">Pay when you receive</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'COD' ? 'border-purple-500 bg-purple-500' : 'border-white/30'
              }`}>
                {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => onPaymentMethodChange('Prepaid')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'Prepaid'
                ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                : 'border-white/20 bg-brand-surface hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-brand-primary">Pay Online</h3>
                <p className="text-sm text-brand-secondary mt-1">UPI, Cards & more</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'Prepaid' ? 'border-purple-500 bg-purple-500' : 'border-white/30'
              }`}>
                {paymentMethod === 'Prepaid' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <Button type="submit" className="w-full py-3">
        {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
      </Button>
    </form>
  );
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart, currency, isAuthenticated, user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Prepaid'>('COD');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Prices are tax-inclusive; no extra tax added at checkout
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      const fetchAddresses = async () => {
        try {
          setLoadingAddresses(true);
          const response = await api.getUserProfile();
          if (response.success && response.addresses) {
            setSavedAddresses(response.addresses || []);
            // Auto-select primary address if exists
            const primaryAddress = response.addresses.find((addr: any) => addr.is_primary);
            if (primaryAddress) {
              setSelectedAddressId(primaryAddress.id);
              setUseNewAddress(false);
            } else if (response.addresses.length === 1) {
              // If only one address, select it
              setSelectedAddressId(response.addresses[0].id);
              setUseNewAddress(false);
            }
          }
        } catch (err) {
          console.error('Failed to load addresses:', err);
        } finally {
          setLoadingAddresses(false);
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Check if user was redirected back after cancelling payment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cancelled') === 'true') {
      setIsSubmitting(false);
    }
  }, [location]);

  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);

  const handlePlaceOrder = async (formData: any, gateway: 'COD' | 'Prepaid') => {
    setIsSubmitting(true);
    
    try {
      // Use selected address if available and not using new address, otherwise use form data
      let addressData;
      if (!useNewAddress && selectedAddress) {
        // Use selected saved address
        addressData = {
          firstName: selectedAddress.first_name,
          lastName: selectedAddress.last_name,
          email: user?.email || selectedAddress.email || formData.email,
          phone: selectedAddress.phone || formData.phone,
          address: selectedAddress.address1,
          address2: selectedAddress.address2 || '',
          city: selectedAddress.city,
          state: selectedAddress.province || '',
          zip: selectedAddress.zip,
        };
      } else {
        // Use new address from form
        addressData = {
          ...formData,
          address2: formData.address2 || '',
        };
      }

      const orderDetails = {
        customer: addressData,
        items: cart,
        total: total,
      };

      // Step 1: Create order in database
      const result = await api.submitOrder(orderDetails, gateway);
      
      if (!result.success) {
        alert(result.message || 'There was an issue placing your order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Handle payment based on gateway
      if (gateway === 'COD') {
        clearCart();
        navigate(`/order-success?orderNumber=${result.orderNumber}&gateway=COD`);
      } else if (gateway === 'Prepaid') {
        if (!result.orderId || !result.orderNumber) {
          alert('Order created but payment initialization failed. Please contact support.');
          setIsSubmitting(false);
          return;
        }

        try {
          const razorpayResponse = await api.createRazorpayOrder(
            result.orderId,
            result.orderNumber,
            total
          );

          if (!razorpayResponse.success || !razorpayResponse.razorpay) {
            throw new Error('Failed to create Razorpay order');
          }

          const { orderId: razorpayOrderId, keyId, amount } = razorpayResponse.razorpay;
          const callbackUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/payments/callback`;
          const cancelUrl = `${window.location.origin}/checkout?cancelled=true`;

          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://api.razorpay.com/v1/checkout/embedded';
          form.style.display = 'none';

          const fields = {
            'key_id': keyId,
            'amount': amount.toString(),
            'order_id': razorpayOrderId,
            'name': 'Tinge Clothing',
            'description': `Order #${result.orderNumber}`,
            'prefill[name]': `${addressData.firstName} ${addressData.lastName}`,
            'prefill[email]': addressData.email,
            'prefill[contact]': addressData.phone || '',
            'notes[order_id]': result.orderId,
            'notes[order_number]': result.orderNumber,
            'callback_url': callbackUrl,
            'cancel_url': cancelUrl,
          };

          Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } catch (error: any) {
          console.error('Error initializing payment:', error);
          alert('Failed to initialize payment. Please try again or choose Cash on Delivery.');
          setIsSubmitting(false);
        }
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert('There was an issue placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">Your cart is empty.</h1>
        <Button onClick={() => navigate('/')} className="mt-6">Go to Homepage</Button>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          <main className="lg:col-span-1 bg-brand-surface p-8 rounded-lg shadow-sm border border-white/10">
            {isSubmitting ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-brand-primary">
                  {paymentMethod === 'COD' 
                    ? 'Placing your order...' 
                    : 'Redirecting to payment gateway...'}
                </p>
              </div>
            ) : (
              <>
                {/* Address Selection for Logged-in Users */}
                {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-brand-primary mb-4">Select Delivery Address</h2>
                    <div className="space-y-3 mb-4">
                      {savedAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/20 bg-brand-surface hover:border-purple-500/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={(e) => {
                              setSelectedAddressId(e.target.value);
                              setUseNewAddress(false);
                            }}
                            className="mt-1 mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {address.is_primary && (
                                <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">
                                  Primary
                                </span>
                              )}
                              {address.label && (
                                <span className="text-sm font-semibold text-brand-primary">
                                  {address.label}
                                </span>
                              )}
                            </div>
                            <p className="text-brand-primary font-medium">
                              {address.first_name} {address.last_name}
                            </p>
                            <p className="text-sm text-brand-secondary">
                              {address.address1}
                              {address.address2 && `, ${address.address2}`}
                            </p>
                            <p className="text-sm text-brand-secondary">
                              {address.city}, {address.province} {address.zip}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-brand-secondary mt-1">Phone: {address.phone}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUseNewAddress(true);
                        setSelectedAddressId(null);
                      }}
                      className="w-full mb-6"
                    >
                      + Use Different Delivery Address
                    </Button>
                  </div>
                )}

                {/* Show form for new address or if no saved addresses */}
                {(useNewAddress || !isAuthenticated || savedAddresses.length === 0) && (
                  <CheckoutForm
                    onSubmit={handlePlaceOrder}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    initialData={selectedAddress && !useNewAddress ? selectedAddress : user ? {
                      email: user.email,
                      first_name: user.name?.split(' ')[0] || '',
                      last_name: user.name?.split(' ').slice(1).join(' ') || '',
                    } : undefined}
                  />
                )}

                {/* Show payment method and submit button if address is selected */}
                {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && selectedAddressId && (
                  <div className="mt-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-medium text-brand-primary mb-4">Payment Method</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('COD')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'COD'
                              ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                              : 'border-white/20 bg-brand-surface hover:border-purple-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-brand-primary">Cash on Delivery</h3>
                              <p className="text-sm text-brand-secondary mt-1">Pay when you receive</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'COD' ? 'border-purple-500 bg-purple-500' : 'border-white/30'
                            }`}>
                              {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Prepaid')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'Prepaid'
                              ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                              : 'border-white/20 bg-brand-surface hover:border-purple-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-brand-primary">Pay Online</h3>
                              <p className="text-sm text-brand-secondary mt-1">UPI, Cards & more</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'Prepaid' ? 'border-purple-500 bg-purple-500' : 'border-white/30'
                            }`}>
                              {paymentMethod === 'Prepaid' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePlaceOrder({}, paymentMethod)}
                      className="w-full py-3"
                    >
                      {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
          <aside className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-brand-surface p-6 rounded-lg shadow-sm border border-white/10">
              <h2 className="text-lg font-medium text-brand-primary">Order Summary</h2>
              <ul className="mt-6 divide-y divide-white/10">
                {cart.map(item => (
                  <li key={item.id} className="flex py-4 space-x-4">
                    <img src={item.imageUrl || item.main_image_url} alt={item.name || item.title} className="w-16 h-16 rounded-md object-cover"/>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-brand-primary">{item.name || item.title}</h3>
                      <p className="text-sm text-brand-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-brand-primary">{formatCurrency(item.price * item.quantity, currency)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm text-brand-secondary">
                  <span>Subtotal</span>
                  <span className="text-brand-primary">{formatCurrency(subtotal, currency)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-brand-secondary">
                    <span>Shipping</span>
                    <span className="text-brand-primary">{formatCurrency(shippingCost, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium text-brand-primary pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
                <p className="text-xs text-brand-secondary">
                  Prices are inclusive of all applicable GST.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
