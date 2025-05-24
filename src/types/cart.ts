
import { Product } from '@/types/product';

export type CartItem = {
  product: Product;
  quantity: number;
};

// Email notification settings
export type EmailSettings = {
  adminEmail: string;
  dispatchEmail?: string;
  accountsEmail?: string;
  notifyAdmin: boolean;
  notifyDispatch?: boolean;
  notifyAccounts?: boolean;
  notifyCustomer: boolean;
  customerTemplate?: string;
  adminTemplate?: string;
  dispatchTemplate?: string;
  accountsTemplate?: string;
};

export type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  emailSettings: EmailSettings;
  updateEmailSettings: (settings: Partial<EmailSettings>) => void;
};
