
import { CartItem } from '@/types/cart';

export const loadCartFromStorage = (): CartItem[] => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error('Failed to parse cart data', e);
      localStorage.removeItem('cart'); // Clear invalid data
    }
  }
  return [];
};

export const saveCartToStorage = (items: CartItem[]): void => {
  localStorage.setItem('cart', JSON.stringify(items));
};
