
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CartItem, EmailSettings } from '@/types/cart';
import { Product } from '@/types/product';
import { validateProductMinimum, validateCategoryMOQ, checkCategoryMOQAfterRemoval } from '@/utils/cartValidation';
import { loadEmailSettings, saveEmailSettings } from '@/utils/emailSettings';
import { loadCartFromStorage, saveCartToStorage } from '@/utils/cartStorage';

export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(loadEmailSettings());
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    setItems(loadCartFromStorage());
    setEmailSettings(loadEmailSettings());
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Save email settings to localStorage
  useEffect(() => {
    saveEmailSettings(emailSettings);
  }, [emailSettings]);

  const updateEmailSettings = useCallback((settings: Partial<EmailSettings>) => {
    setEmailSettings(prev => {
      const updated = { ...prev, ...settings };
      return updated;
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    // Check for individual product minimum quantity
    const productValidation = validateProductMinimum(product, quantity);
    
    if (!productValidation.isValid) {
      toast({
        title: "Minimum quantity not met",
        description: productValidation.message,
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
      const categoryValidation = validateCategoryMOQ(newItems, product);
      
      if (categoryValidation.hasWarning) {
        toast({
          title: "Category minimum not yet met",
          description: categoryValidation.message,
          variant: "default"
        });
      } else if (categoryValidation.isSuccess) {
        toast({
          title: "Category minimum met! ✅",
          description: categoryValidation.message,
        });
      }
      
      return newItems;
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      const newItems = prevItems.filter(item => item.product.id !== productId);
      
      // Check if removing this item affects category MOQ
      if (itemToRemove) {
        const categoryCheck = checkCategoryMOQAfterRemoval(newItems, itemToRemove.product);
        
        if (categoryCheck.hasWarning) {
          toast({
            title: "Category minimum warning",
            description: categoryCheck.message,
            variant: "destructive"
          });
        }
      }
      
      return newItems;
    });
    
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
    
    setItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      );
      
      // Check category MOQ after updating quantity
      const updatedItem = newItems.find(item => item.product.id === productId);
      if (updatedItem) {
        const categoryValidation = validateCategoryMOQ(newItems, updatedItem.product);
        
        if (categoryValidation.hasWarning) {
          toast({
            title: "Category minimum not met",
            description: categoryValidation.message,
            variant: "destructive"
          });
        }
      }
      
      return newItems;
    });
  }, [removeFromCart, toast]);

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
