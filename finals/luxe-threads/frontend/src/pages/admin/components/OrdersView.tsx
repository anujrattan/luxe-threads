import React from 'react';
import { Card, Button } from '../../../components/ui';
import { ShoppingBagIcon, EditIcon } from '../../../components/icons';
import { formatCurrency } from '../../../utils/currency';

interface OrdersViewProps {
  orders: any[];
  loading: boolean;
  currency: string;
  onSelectOrder: (order: any) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  loading,
  currency,
  onSelectOrder,
}) => {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-brand-secondary opacity-50" />
        <h3 className="text-xl font-semibold text-brand-primary mb-2">No Orders Yet</h3>
        <p className="text-brand-secondary">Orders will appear here once customers place them</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-brand-primary uppercase tracking-wider">Order #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-brand-primary uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-brand-surface divide-y divide-white/10">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-semibold text-brand-primary">{order.order_number}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-brand-primary">
                      {order.users?.first_name} {order.users?.last_name}
                    </p>
                    <p className="text-xs text-brand-secondary">{order.users?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-brand-primary">{order.items?.length || 0} items</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-brand-primary">
                    {formatCurrency(order.total_amount, currency)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs text-brand-secondary">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => onSelectOrder(order)}
                    className="p-2 hover:bg-purple-500/10"
                    aria-label="View order details"
                  >
                    <EditIcon className="w-4 h-4 text-brand-secondary group-hover:text-purple-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

