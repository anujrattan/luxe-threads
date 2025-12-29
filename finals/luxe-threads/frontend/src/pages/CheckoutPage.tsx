import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import api from '../services/api';
import { TAX_RATE } from '../utils/constants';
import { useApp } from '../context/AppContext';

const CheckoutForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-brand-primary">Contact Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-brand-secondary">Full Name</label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1"/>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-secondary">Email</label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1"/>
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
            <label htmlFor="address" className="block text-sm font-medium text-brand-secondary">Address</label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1"/>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
       <Button type="submit" className="w-full py-3">Place Order</Button>
    </form>
  );
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal * (1 + TAX_RATE);

  const handlePlaceOrder = async (formData: any) => {
    setIsSubmitting(true);
    const orderDetails = {
      customer: formData,
      items: cart,
      total: total,
    };
    const result = await api.submitOrder(orderDetails);
    setIsSubmitting(false);
    if (result.success) {
      clearCart();
      navigate('/order-success');
    } else {
      alert('There was an issue placing your order. Please try again.');
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
             {isSubmitting ? <div className="text-center py-10">Placing your order...</div> : <CheckoutForm onSubmit={handlePlaceOrder} />}
          </main>
          <aside className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-brand-surface p-6 rounded-lg shadow-sm border border-white/10">
              <h2 className="text-lg font-medium text-brand-primary">Order Summary</h2>
              <ul className="mt-6 divide-y divide-white/10">
                {cart.map(item => (
                  <li key={item.id} className="flex py-4 space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-brand-primary">{item.name}</h3>
                       <p className="text-sm text-brand-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-brand-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                 <div className="flex justify-between text-sm text-brand-secondary">
                   <span>Subtotal</span>
                   <span className="text-brand-primary">${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-brand-secondary">
                   <span>Taxes</span>
                   <span className="text-brand-primary">${(total - subtotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-base font-medium text-brand-primary">
                   <span>Total</span>
                   <span>${total.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
