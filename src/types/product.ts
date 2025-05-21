
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank-transfer';
};
