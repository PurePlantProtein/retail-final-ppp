
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CartItem, EmailSettings } from '@/types/cart';
import { Product } from '@/types/product';

// Default email settings
export const defaultEmailSettings: EmailSettings = {
  adminEmail: 'sales@ppprotein.com.au',
  dispatchEmail: '',
  accountsEmail: '',
  notifyAdmin: true,
  notifyDispatch: false,
  notifyAccounts: false,
  notifyCustomer: true,
  customerTemplate: '',
  adminTemplate: '',
  dispatchTemplate: '',
  accountsTemplate: ''
};

export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(defaultEmailSettings);
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data', e);
        localStorage.removeItem('cart'); // Clear invalid data
      }
    }
    
    // Load email settings
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      try {
        setEmailSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse email settings', e);
        localStorage.removeItem('emailSettings');
        setEmailSettings(defaultEmailSettings);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save email settings to localStorage
  useEffect(() => {
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
  }, [emailSettings]);

  const updateEmailSettings = useCallback((settings: Partial<EmailSettings>) => {
    setEmailSettings(prev => {
      const updated = { ...prev, ...settings };
      return updated;
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if product already in cart
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart.",
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  }, [toast]);

  // Calculate derived values
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    emailSettings,
    updateEmailSettings,
  };
}
