import React from 'react';
import { Card, Button, Input, Select } from '../../../components/ui';
import { XIcon } from '../../../components/icons';
import { formatCurrency } from '../../../utils/currency';

interface OrderDetailViewProps {
  order: any;
  orderProducts: Record<string, any>;
  currency: string;
  onClose: () => void;
  onStatusUpdate: (orderNumber: string, status: string) => Promise<void>;
  onFulfillmentPartnerUpdate: (orderNumber: string, partner: string | null) => Promise<void>;
  onPartnerOrderIdUpdate: (orderNumber: string, orderId: string | null) => Promise<void>;
  updatingStatus: boolean;
  updatingFulfillmentPartner: boolean;
  updatingPartnerOrderId: boolean;
  partnerOrderIdInput: string;
  onPartnerOrderIdInputChange: (value: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  orderProducts,
  currency,
  onClose,
  onStatusUpdate,
  onFulfillmentPartnerUpdate,
  onPartnerOrderIdUpdate,
  updatingStatus,
  updatingFulfillmentPartner,
  updatingPartnerOrderId,
  partnerOrderIdInput,
  onPartnerOrderIdInputChange,
}) => {
  const handleStatusChange = async (newStatus: string) => {
    await onStatusUpdate(order.order_number, newStatus);
  };

  const handleFulfillmentPartnerChange = async (newPartner: string) => {
    const partnerValue = newPartner === '' ? null : newPartner;
    await onFulfillmentPartnerUpdate(order.order_number, partnerValue);
  };

  const handlePartnerOrderIdBlur = async () => {
    const orderIdValue = partnerOrderIdInput.trim() || null;
    if (orderIdValue !== (order.partner_order_id || null)) {
      await onPartnerOrderIdUpdate(order.order_number, orderIdValue);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-brand-primary">Order Details</h3>
        <Button onClick={onClose} variant="ghost">
          <XIcon className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-brand-secondary mb-1">Order Number</p>
            <p className="text-lg font-semibold text-brand-primary">{order.order_number}</p>
          </div>
          <div>
            <p className="text-sm text-brand-secondary mb-2">Status</p>
            <Select
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={order.status || 'pending'}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="min-w-[180px]"
            />
          </div>
          <div>
            <p className="text-sm text-brand-secondary mb-1">Payment Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
              order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {order.payment_status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          <div>
            <p className="text-sm text-brand-secondary mb-2">Fulfillment Partner</p>
            <Select
              options={[
                { value: '', label: 'Not Assigned' },
                { value: 'Qikink', label: 'Qikink' },
                { value: 'Printrove', label: 'Printrove' },
              ]}
              value={order.fulfillment_partner || ''}
              onChange={handleFulfillmentPartnerChange}
              disabled={updatingFulfillmentPartner}
              className="min-w-[180px]"
            />
            {/* Partner Order ID Input - shown when fulfillment partner is selected */}
            {order.fulfillment_partner && (
              <div className="mt-3">
                <p className="text-sm text-brand-secondary mb-2">
                  {order.fulfillment_partner} Order ID
                </p>
                <div className="relative">
                  <Input
                    type="text"
                    value={partnerOrderIdInput}
                    onChange={(e) => onPartnerOrderIdInputChange(e.target.value)}
                    onBlur={handlePartnerOrderIdBlur}
                    placeholder={`Enter ${order.fulfillment_partner} order ID`}
                    disabled={updatingPartnerOrderId}
                    className="w-full"
                  />
                  {updatingPartnerOrderId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-secondary">
                      Saving...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-brand-secondary mb-1">Date</p>
            <p className="text-sm text-brand-primary">
              {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        {order.users && (
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-lg font-semibold text-brand-primary mb-4">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-brand-secondary mb-1">Name</p>
                <p className="text-brand-primary">{order.users.first_name} {order.users.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-brand-secondary mb-1">Email</p>
                <p className="text-brand-primary">{order.users.email}</p>
              </div>
              {order.users.phone && (
                <div>
                  <p className="text-sm text-brand-secondary mb-1">Phone</p>
                  <p className="text-brand-primary">{order.users.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.users && (
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-lg font-semibold text-brand-primary mb-4">Shipping Address</h4>
            <div className="bg-brand-bg/50 p-4 rounded-lg">
              <p className="text-brand-primary">
                {order.users.first_name} {order.users.last_name}
              </p>
              <p className="text-brand-primary">{order.users.address1}</p>
              {order.users.address2 && (
                <p className="text-brand-primary">{order.users.address2}</p>
              )}
              <p className="text-brand-primary">
                {order.users.city}, {order.users.province} {order.users.zip}
              </p>
              <p className="text-brand-primary">{order.users.country_code}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-semibold text-brand-primary mb-4">Order Items</h4>
          <div className="space-y-3">
            {order.items?.map((item: any, index: number) => {
              const product = orderProducts[item.product_id];
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-brand-bg/50 rounded-lg">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-brand-surface border border-white/10">
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
                    <p className="font-semibold text-brand-primary">{item.product_name}</p>
                    <p className="text-sm text-brand-secondary">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-primary">
                      {formatCurrency(item.total_price, currency)}
                    </p>
                    <p className="text-xs text-brand-secondary">
                      {formatCurrency(item.unit_price, currency)} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-semibold text-brand-primary mb-4">Order Summary</h4>
          <div className="bg-brand-bg/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-secondary">Subtotal</span>
              <span className="text-brand-primary">{formatCurrency(order.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-secondary">Tax</span>
              <span className="text-brand-primary">{formatCurrency(order.tax_amount, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-secondary">Shipping</span>
              <span className="text-brand-primary">{formatCurrency(order.shipping_cost, currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
              <span className="text-brand-primary">Total</span>
              <span className="text-brand-primary">{formatCurrency(order.total_amount, currency)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-brand-secondary">Payment Gateway</span>
              <span className="text-brand-primary">{order.gateway || 'COD'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

