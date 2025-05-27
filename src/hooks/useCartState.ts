
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CartItem, EmailSettings } from '@/types/cart';
import { Product } from '@/types/product';
import { validateProductMinimum, validateCategoryMOQ, checkCategoryMOQAfterRemoval } from '@/utils/cartValidation';
import { loadEmailSettings, saveEmailSettings } from '@/utils/emailSettings';
import { loadCartFromStorage, saveCartToStorage } from '@/utils/cartStorage';
import { getCategoryMOQ, getCategoryTotalQuantity } from '@/utils/categoryMOQ';

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
      const categoryMOQ = getCategoryMOQ(product.category || '');
      if (categoryMOQ) {
        const totalCategoryQuantity = getCategoryTotalQuantity(newItems, product.category || '');
        
        if (totalCategoryQuantity < categoryMOQ) {
          const remainingNeeded = categoryMOQ - totalCategoryQuantity;
          toast({
            title: "Category minimum info",
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
        const categoryMOQ = getCategoryMOQ(updatedItem.product.category || '');
        if (categoryMOQ) {
          const totalCategoryQuantity = getCategoryTotalQuantity(newItems, updatedItem.product.category || '');
          
          if (totalCategoryQuantity < categoryMOQ) {
            const remainingNeeded = categoryMOQ - totalCategoryQuantity;
            toast({
              title: "Category minimum info",
              description: `You need ${remainingNeeded} more units from the ${updatedItem.product.category} category to meet the minimum order of ${categoryMOQ} units.`,
              variant: "default"
            });
          }
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
