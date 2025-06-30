
import { Order, OrderItem, ShippingOption, ShippingAddress, OrderStatus, InvoiceStatus } from '@/types/product';
import { mapProductForClient } from './productUtils';
import { Database } from '@/integrations/supabase/types';

/**
 * Ensures an order object has all required properties formatted correctly
 */
export const normalizeOrder = (
  row: Database["public"]["Tables"]["orders"]["Row"]
): Order => {
  const items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
  const shippingAddress = typeof row.shipping_address === 'string'
    ? JSON.parse(row.shipping_address)
    : row.shipping_address;

  const shippingOption = typeof row.shipping_option === 'string'
    ? JSON.parse(row.shipping_option)
    : row.shipping_option;

  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name || '',
    email: row.email || '',
    items: (items as any[]).map((item) => ({
      product: mapProductForClient(item.product),
      quantity: item.quantity,
      ...item,
    })),
    total: row.total || 0,
    status: (row.status as OrderStatus) || 'pending',
    createdAt: row.created_at,
    paymentMethod: row.payment_method || '',
    shippingAddress,
    invoiceStatus: (row.invoice_status as InvoiceStatus) || undefined,
    shippingOption,
    updatedAt: row.updated_at || row.created_at,
  };
};
