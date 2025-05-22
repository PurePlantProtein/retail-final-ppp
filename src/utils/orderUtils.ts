
import { Order, OrderItem, ShippingOption } from '@/types/product';
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
    email: order.email || '',
    items: (order.items || []).map((item: OrderItem) => ({
      ...item,
      product: mapProductForClient(item.product)
    })),
    total: order.total || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    paymentMethod: order.paymentMethod || '',
    invoiceStatus: order.invoiceStatus,
    invoiceUrl: order.invoiceUrl,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    // Handle shippingOption specially since we've broken it up into separate fields
    shippingOption: order.shippingOption || (order.shippingOptionId ? {
      id: order.shippingOptionId as string,
      name: order.shippingOptionName as string,
      price: order.shippingOptionPrice as number,
      carrier: order.shippingCarrier as string,
      description: '',
      estimatedDeliveryDays: 0
    } as ShippingOption : undefined),
    updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
  };

  return normalizedOrder;
};
