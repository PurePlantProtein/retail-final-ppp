
import { Order, OrderItem, ShippingOption } from '@/types/product';
import { mapProductForClient } from './productUtils';
import { Database } from '@/integrations/supabase/types';

/**
 * Ensures an order object has all required properties formatted correctly
 */
export const normalizeOrder = (
  row: Database["public"]["Tables"]["orders"]["Row"]
): Order => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  email: row.email,
  items: (row.items as Record<string, any>[]).map((item) => ({
    product: mapProductForClient(item.product),
    quantity: item.quantity,
    // add other OrderItem fields here if needed
    ...item,
  })),
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
  paymentMethod: row.payment_method,
  shippingAddress: row.shipping_address,
  invoiceStatus: row.invoice_status,
  shippingOption: row.shipping_option,
  updatedAt: row.updated_at,
});
// export const normalizeOrder = (order: Partial<Order>): Order => {
//   // Map any snake_case properties to camelCase and ensure all fields are present
//   const normalizedOrder: Order = {
//     id: order.id || '',
//     userId: order.userId || '',
//     userName: order.userName || '',
//     email: order.email || '',
//     items: (order.items || []).map((item: OrderItem) => ({
//       ...item,
//       product: mapProductForClient(item.product)
//     })),
//     total: order.total || 0,
//     status: order.status || 'pending',
//     createdAt: order.createdAt || new Date().toISOString(),
//     paymentMethod: order.paymentMethod || '',
//     invoiceStatus: order.invoiceStatus,
//     invoiceUrl: order.invoiceUrl,
//     shippingAddress: order.shippingAddress,
//     notes: order.notes,
//     shippingOption: order.shippingOption || undefined,
//     updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
//   };

//   return normalizedOrder;
// };
