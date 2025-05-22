
import { Order, OrderItem } from '@/types/product';
import { mapProductForClient } from './productUtils';

/**
 * Ensures an order object has all required properties formatted correctly
 */
export const normalizeOrder = (order: Partial<Order>): Order => {
  // Map any snake_case properties to camelCase and ensure all fields are present
  const normalizedOrder: Order = {
    id: order.id || '',
    userId: order.userId || '',
    userName: order.userName || '',
    email: order.email,
    items: (order.items || []).map((item: OrderItem) => ({
      ...item,
      product: mapProductForClient(item.product)
    })),
    total: order.total || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    paymentMethod: order.paymentMethod || '',
    invoiceStatus: order.invoiceStatus,
    invoiceNumber: order.invoiceNumber,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    invoiceUrl: order.invoiceUrl,
    shippingOption: order.shippingOption,
    updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
  };

  return normalizedOrder;
};
