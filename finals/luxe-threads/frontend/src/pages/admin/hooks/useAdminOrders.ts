import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const useAdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderProducts, setOrderProducts] = useState<Record<string, any>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingFulfillmentPartner, setUpdatingFulfillmentPartner] = useState(false);
  const [updatingPartnerOrderId, setUpdatingPartnerOrderId] = useState(false);
  const [partnerOrderIdInput, setPartnerOrderIdInput] = useState('');

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch product images when an order is selected
  useEffect(() => {
    if (selectedOrder?.items) {
      const fetchProductImages = async () => {
        try {
          const productIds = [...new Set(selectedOrder.items.map((item: any) => item.product_id).filter(Boolean))];
          const productPromises = productIds.map((id: string) => api.getProductById(id));
          const productResults = await Promise.all(productPromises);
          
          const productsMap: Record<string, any> = {};
          productResults.forEach((product) => {
            if (product) {
              productsMap[product.id] = product;
            }
          });
          setOrderProducts(productsMap);
        } catch (error) {
          console.error('Failed to fetch product images:', error);
        }
      };
      fetchProductImages();
    } else {
      setOrderProducts({});
    }
  }, [selectedOrder]);

  // Initialize partner order ID input when order is selected
  useEffect(() => {
    if (selectedOrder) {
      setPartnerOrderIdInput(selectedOrder.partner_order_id || '');
    } else {
      setPartnerOrderIdInput('');
    }
  }, [selectedOrder]);

  const selectOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const clearSelection = () => {
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderNumber: string, status: string): Promise<void> => {
    try {
      setUpdatingStatus(true);
      const response = await api.updateOrderStatus(orderNumber, status);
      if (response.success) {
        // Update the selected order status
        if (selectedOrder && selectedOrder.order_number === orderNumber) {
          setSelectedOrder({
            ...selectedOrder,
            status: status,
          });
        }
        // Refresh orders list to update status badge
        await fetchOrders();
        showToast(`Order status updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`, 'success');
      } else {
        showToast(response.message || 'Failed to update order status', 'error');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      showToast(error.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateFulfillmentPartner = async (orderNumber: string, partner: string | null): Promise<void> => {
    try {
      setUpdatingFulfillmentPartner(true);
      const response = await api.updateOrderFulfillmentPartner(orderNumber, partner);
      if (response.success) {
        // Update the selected order fulfillment partner
        if (selectedOrder && selectedOrder.order_number === orderNumber) {
          setSelectedOrder({
            ...selectedOrder,
            fulfillment_partner: partner,
          });
        }
        // Refresh orders list
        await fetchOrders();
        showToast(
          partner 
            ? `Fulfillment partner set to ${partner}` 
            : 'Fulfillment partner removed',
          'success'
        );
      } else {
        showToast(response.message || 'Failed to update fulfillment partner', 'error');
      }
    } catch (error: any) {
      console.error('Error updating fulfillment partner:', error);
      showToast(error.message || 'Failed to update fulfillment partner', 'error');
    } finally {
      setUpdatingFulfillmentPartner(false);
    }
  };

  const updatePartnerOrderId = async (orderNumber: string, orderId: string | null): Promise<void> => {
    try {
      setUpdatingPartnerOrderId(true);
      const response = await api.updateOrderPartnerOrderId(orderNumber, orderId);
      if (response.success) {
        // Update the selected order partner order ID
        if (selectedOrder && selectedOrder.order_number === orderNumber) {
          setSelectedOrder({
            ...selectedOrder,
            partner_order_id: orderId,
          });
        }
        // Refresh orders list
        await fetchOrders();
        const partnerName = selectedOrder?.fulfillment_partner || 'Partner';
        showToast(
          orderId 
            ? `${partnerName} order ID saved successfully` 
            : 'Partner order ID cleared',
          'success'
        );
      } else {
        showToast(response.message || 'Failed to update partner order ID', 'error');
        // Reset input to current value on error
        if (selectedOrder && selectedOrder.order_number === orderNumber) {
          setPartnerOrderIdInput(selectedOrder.partner_order_id || '');
        }
      }
    } catch (error: any) {
      console.error('Error updating partner order ID:', error);
      showToast(error.message || 'Failed to update partner order ID', 'error');
      // Reset input to current value on error
      if (selectedOrder && selectedOrder.order_number === orderNumber) {
        setPartnerOrderIdInput(selectedOrder.partner_order_id || '');
      }
    } finally {
      setUpdatingPartnerOrderId(false);
    }
  };

  return {
    orders,
    selectedOrder,
    orderProducts,
    ordersLoading,
    updatingStatus,
    updatingFulfillmentPartner,
    updatingPartnerOrderId,
    partnerOrderIdInput,
    fetchOrders,
    selectOrder,
    clearSelection,
    updateOrderStatus,
    updateFulfillmentPartner,
    updatePartnerOrderId,
    setPartnerOrderIdInput,
  };
};

