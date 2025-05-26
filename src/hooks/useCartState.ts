
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

// Add the utility function for category MOQ
const getCategoryMOQ = (category: string): number | undefined => {
  // Define the MOQ values for different categories
  const categoryMOQs: Record<string, number> = {
    'Protein Powder': 12,
    'protein powder': 12, // Handle case variations
    // Add more categories with their MOQ as needed
  };

  return categoryMOQs[category] || categoryMOQs[category?.toLowerCase()];
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

  // Helper function to get total quantity of products in a specific category
  const getCategoryTotalQuantity = useCallback((items: CartItem[], category: string): number => {
    return items
      .filter(item => 
        item.product.category?.toLowerCase() === category?.toLowerCase() ||
        item.product.category === category
      )
      .reduce((total, item) => total + item.quantity, 0);
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    // Check for individual product minimum quantity
    const minQty = product.min_quantity || 1;
    
    if (quantity < minQty) {
      toast({
        title: "Minimum quantity not met",
        description: `You must order at least ${minQty} units of ${product.name}.`,
        variant: "destructive"
      });
      return;
    }
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        // Update quantity if product already in cart
        newItems = prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...prevItems, { product, quantity }];
      }
      
      // Check category MOQ after adding the product
      const categoryMOQ = getCategoryMOQ(product.category || '');
      if (categoryMOQ) {
        const totalCategoryQuantity = getCategoryTotalQuantity(newItems, product.category || '');
        
        if (totalCategoryQuantity < categoryMOQ) {
          const remainingNeeded = categoryMOQ - totalCategoryQuantity;
          toast({
            title: "Category minimum not yet met",
            description: `You need ${remainingNeeded} more units from the ${product.category} category to meet the minimum order of ${categoryMOQ} units. You can mix and match different products from this category.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Category minimum met! ✅",
            description: `Great! You now have ${totalCategoryQuantity} units from the ${product.category} category, meeting the minimum requirement.`,
          });
        }
      }
      
      return newItems;
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  }, [toast, getCategoryTotalQuantity]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      const newItems = prevItems.filter(item => item.product.id !== productId);
      
      // Check if removing this item affects category MOQ
      if (itemToRemove) {
        const categoryMOQ = getCategoryMOQ(itemToRemove.product.category || '');
        if (categoryMOQ) {
          const totalCategoryQuantity = getCategoryTotalQuantity(newItems, itemToRemove.product.category || '');
          
          if (totalCategoryQuantity > 0 && totalCategoryQuantity < categoryMOQ) {
            const remainingNeeded = categoryMOQ - totalCategoryQuantity;
            toast({
              title: "Category minimum warning",
              description: `You now need ${remainingNeeded} more units from the ${itemToRemove.product.category} category to meet the minimum order of ${categoryMOQ} units.`,
              variant: "destructive"
            });
          }
        }
      }
      
      return newItems;
    });
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart.",
    });
  }, [toast, getCategoryTotalQuantity]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      );
      
      // Check category MOQ after updating quantity
      const updatedItem = newItems.find(item => item.product.id === productId);
      if (updatedItem) {
        const categoryMOQ = getCategoryMOQ(updatedItem.product.category || '');
        if (categoryMOQ) {
          const totalCategoryQuantity = getCategoryTotalQuantity(newItems, updatedItem.product.category || '');
          
          if (totalCategoryQuantity < categoryMOQ) {
            const remainingNeeded = categoryMOQ - totalCategoryQuantity;
            toast({
              title: "Category minimum not met",
              description: `You need ${remainingNeeded} more units from the ${updatedItem.product.category} category to meet the minimum order of ${categoryMOQ} units.`,
              variant: "destructive"
            });
          }
        }
      }
      
      return newItems;
    });
  }, [removeFromCart, toast, getCategoryTotalQuantity]);

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
