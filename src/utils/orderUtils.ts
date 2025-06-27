
import { Order, OrderItem, ShippingAddress, ShippingOption, OrderStatus, InvoiceStatus } from '@/types/product';

export const transformDatabaseOrder = (dbOrder: any): Order => {
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id,
    userName: dbOrder.user_name || '',
    email: dbOrder.email || '',
    items: Array.isArray(dbOrder.items) ? dbOrder.items.map((item: any): OrderItem => ({
      product: item.product,
      quantity: item.quantity
    })) : [],
    total: dbOrder.total || 0,
    status: (dbOrder.status as OrderStatus) || 'pending',
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    shippingAddress: (typeof dbOrder.shipping_address === 'object' && dbOrder.shipping_address !== null) 
      ? dbOrder.shipping_address as ShippingAddress 
      : {
          name: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Australia',
          phone: ''
        },
    invoiceStatus: (dbOrder.invoice_status as InvoiceStatus) || 'draft',
    invoiceUrl: dbOrder.invoice_url,
    paymentMethod: dbOrder.payment_method || 'bank-transfer',
    shippingOption: (typeof dbOrder.shipping_option === 'object' && dbOrder.shipping_option !== null) 
      ? dbOrder.shipping_option as ShippingOption 
      : {
          id: 'standard',
          name: 'Standard Shipping',
          price: 0,
          description: 'Standard shipping'
        },
    notes: dbOrder.notes
  };
};
