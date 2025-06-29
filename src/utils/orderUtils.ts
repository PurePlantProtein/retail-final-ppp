
import { Order, OrderItem, ShippingOption, ShippingAddress, OrderStatus, InvoiceStatus } from '@/types/product';
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
  userName: row.user_name || '',
  email: row.email || '',
  items: (row.items as any[]).map((item) => ({
    product: mapProductForClient(item.product),
    quantity: item.quantity,
    ...item,
  })),
  total: row.total || 0,
  status: (row.status as OrderStatus) || 'pending',
  createdAt: row.created_at,
  paymentMethod: row.payment_method || '',
  shippingAddress: row.shipping_address as ShippingAddress,
  invoiceStatus: (row.invoice_status as InvoiceStatus) || undefined,
  shippingOption: row.shipping_option as ShippingOption,
  updatedAt: row.updated_at || row.created_at,
});
