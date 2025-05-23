import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Product } from '@/types/product';

type CartItem = {
  product: Product;
  quantity: number;
};

// Added email notification settings
type EmailSettings = {
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

type CartContextType = {
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

const CartContext = createContext<CartContextType | undefined>(undefined);

// Default email settings
const defaultEmailSettings: EmailSettings = {
  adminEmail: 'admin@pureplantprotein.com',
  notifyAdmin: true,
  notifyCustomer: true
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    const savedSettings = localStorage.getItem('emailSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
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
  });
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save email settings to localStorage
  useEffect(() => {
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
  }, [emailSettings]);

  const updateEmailSettings = (settings: Partial<EmailSettings>) => {
    setEmailSettings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('emailSettings', JSON.stringify(updated));
      return updated;
    });
  };

  // Mock email sending function - in a real app, this would call a backend API
  const sendOrderEmails = (order: any, customerEmail: string) => {
    console.log('Sending order confirmation emails:');
    
    if (emailSettings.notifyCustomer) {
      console.log(`- Customer email sent to: ${customerEmail}`);
      console.log(`  Subject: Your Order Confirmation #${order.id}`);
      console.log(`  Content: Thank you for your order! Your order #${order.id} has been received.`);
    }
    
    if (emailSettings.notifyAdmin) {
      console.log(`- Admin notification sent to: ${emailSettings.adminEmail}`);
      console.log(`  Subject: New Order Received #${order.id}`);
      console.log(`  Content: A new order #${order.id} has been placed by ${customerEmail}.`);
    }

    // In a real app with Supabase integration, this would be an API call to a backend service
    // that would use a library like Resend, SendGrid, etc. to send the emails
  };

  const addToCart = (product: Product, quantity: number) => {
    setItems((prevItems) => {
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
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart.",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
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
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  const value = {
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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
