
export type Category = 'electronics' | 'clothing' | 'food' | 'furniture' | 'other';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  image: string;
  stock: number;
  category: Category;
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
