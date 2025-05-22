
// Updated Category type to accept string literals
export type Category = 'electronics' | 'clothing' | 'food' | 'furniture' | 'accessories' | 'supplements' | 'protein' | 'other' | string;

// Updated nutrition-related types
export type AminoAcid = {
  name: string;
  amount: string;
};

export type NutritionalValue = {
  name: string;
  perServing: string;
  per100g: string;
};

// Shipping carriers
export type ShippingCarrier = 'australia-post' | 'transdirect' | 'other';

// Shipping address type
export type ShippingAddress = {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

// Shipping option type
export type ShippingOption = {
  id: string;
  name: string;
  carrier: ShippingCarrier;
  price: number;
  estimatedDeliveryDays: string;
  description?: string;
};

// Order status
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Payment method
export type PaymentMethod = 'paypal' | 'bank-transfer';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  image: string;
  stock: number;
  category: Category;
  // New fields
  servingSize?: string;
  numberOfServings?: number;
  bagSize?: string;
  ingredients?: string;
  aminoAcidProfile?: AminoAcid[];
  nutritionalInfo?: NutritionalValue[];
  // Shipping related fields
  weight?: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number;  // in cm
    height: number; // in cm
  };
};

export type Order = {
  id: string;
  userId: string;
  userName: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  shippingOption?: ShippingOption;
  shippingAddress?: ShippingAddress;
  invoiceUrl?: string; // Field to store URL for Xero invoice
  invoiceId?: string; // Field to store Xero invoice ID
  invoiceStatus?: 'draft' | 'submitted' | 'paid';
};
