import React from 'react';
import { Card, Button } from '../../../components/ui';
import { EditIcon, UserIcon, PackageIcon, CreditCardIcon, CalendarIcon } from '../../../components/icons';
import { formatCurrency } from '../../../utils/currency';

interface OrderCardProps {
  order: any;
  currency: string;
  onSelectOrder: (order: any) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  currency,
  onSelectOrder,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      confirmed: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-white/10 hover:border-purple-500/30">
      <div className="space-y-4">
        {/* Header with Order Number and Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-secondary mb-1">Order Number</p>
            <p className="font-mono text-sm font-bold text-brand-primary">{order.order_number}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => onSelectOrder(order)}
            className="p-2 hover:bg-purple-500/10 rounded-lg"
            aria-label="View order details"
          >
            <EditIcon className="w-5 h-5 text-purple-400" />
          </Button>
        </div>

        {/* Customer Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <UserIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-secondary mb-1">Customer</p>
            <p className="text-sm font-medium text-brand-primary truncate">
              {order.users?.first_name} {order.users?.last_name}
            </p>
            <p className="text-xs text-brand-secondary truncate">{order.users?.email}</p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Items */}
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <PackageIcon className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-brand-secondary">Items</p>
              <p className="text-sm font-semibold text-brand-primary">{order.items?.length || 0}</p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <CreditCardIcon className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-brand-secondary">Total</p>
              <p className="text-sm font-semibold text-brand-primary">
                {formatCurrency(order.total_amount, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {order.status?.toUpperCase() || 'PENDING'}
          </span>
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
            {order.payment_status?.toUpperCase() || 'PENDING'}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <CalendarIcon className="w-3.5 h-3.5 text-brand-secondary" />
          <p className="text-xs text-brand-secondary">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </Card>
  );
};
