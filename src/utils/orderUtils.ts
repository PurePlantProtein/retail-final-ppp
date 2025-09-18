
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
  const rawShippingAddress = typeof row.shipping_address === 'string'
    ? JSON.parse(row.shipping_address)
    : row.shipping_address;

  const rawShippingOption = typeof row.shipping_option === 'string'
    ? JSON.parse(row.shipping_option)
    : row.shipping_option;

  // Helper to coerce numeric-like values
  const num = (v: any): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (typeof v === 'string') {
      const n = parseFloat(v);
      return isFinite(n) ? n : 0;
    }
    return 0;
  };

  // Normalize shipping address keys to expected camelCase shape
  const shippingAddress = rawShippingAddress ? {
    name: rawShippingAddress.name ?? rawShippingAddress.full_name ?? '',
    street: rawShippingAddress.street ?? rawShippingAddress.address1 ?? '',
    city: rawShippingAddress.city ?? '',
    state: rawShippingAddress.state ?? rawShippingAddress.region ?? '',
    postalCode: rawShippingAddress.postalCode ?? rawShippingAddress.postal_code ?? rawShippingAddress.zip ?? '',
    country: rawShippingAddress.country ?? rawShippingAddress.country_code ?? '',
    phone: rawShippingAddress.phone ?? ''
  } : undefined;

  // Normalize shipping option to expected shape
  const shippingOption = rawShippingOption ? {
    id: rawShippingOption.id ?? rawShippingOption.code ?? '',
    name: rawShippingOption.name ?? rawShippingOption.service ?? '',
    price: num(rawShippingOption.price ?? rawShippingOption.cost),
    description: rawShippingOption.description ?? '',
    estimatedDeliveryDays: rawShippingOption.estimatedDeliveryDays ?? rawShippingOption.eta_days ?? 0,
    carrier: rawShippingOption.carrier ?? ''
  } : undefined;

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
  total: num(row.total),
    status: (row.status as OrderStatus) || 'pending',
    createdAt: row.created_at,
    paymentMethod: row.payment_method || '',
    shippingAddress,
    invoiceStatus: (row.invoice_status as InvoiceStatus) || undefined,
    shippingOption,
    invoiceUrl: row.invoice_url || '',
    notes: row.notes || '',
    updatedAt: row.updated_at || row.created_at,
  };
};
