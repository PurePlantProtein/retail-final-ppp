
import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';
import { getCategoryMOQ, getCategoryTotalQuantity } from './categoryMOQ';

export const validateProductMinimum = (product: Product, quantity: number): { isValid: boolean; message?: string } => {
  const minQty = product.min_quantity || 1;
  
  if (quantity < minQty) {
    return {
      isValid: false,
      message: `You must order at least ${minQty} units of ${product.name}.`
    };
  }
  
  return { isValid: true };
};

export const validateCategoryMOQ = (
  items: CartItem[], 
  product: Product,
  addingQuantity: number = 0
): { 
  hasWarning: boolean; 
  isSuccess: boolean; 
  message?: string 
} => {
  const categoryMOQ = getCategoryMOQ(product.category || '');
  
  if (!categoryMOQ) {
    return { hasWarning: false, isSuccess: false };
  }
  
  // Calculate total quantity including the item being added
  const currentCategoryQuantity = getCategoryTotalQuantity(items, product.category || '');
  const totalCategoryQuantity = currentCategoryQuantity + addingQuantity;
  
  if (totalCategoryQuantity < categoryMOQ) {
    const remainingNeeded = categoryMOQ - totalCategoryQuantity;
    return {
      hasWarning: true,
      isSuccess: false,
      message: `You need ${remainingNeeded} more units from the ${product.category} category to meet the minimum order of ${categoryMOQ} units. You can mix and match different products from this category.`
    };
  }
  
  return {
    hasWarning: false,
    isSuccess: true,
    message: `Great! You now have ${totalCategoryQuantity} units from the ${product.category} category, meeting the minimum requirement.`
  };
};

export const checkCategoryMOQAfterRemoval = (
  items: CartItem[], 
  removedProduct: Product
): { hasWarning: boolean; message?: string } => {
  const categoryMOQ = getCategoryMOQ(removedProduct.category || '');
  
  if (!categoryMOQ) {
    return { hasWarning: false };
  }
  
  const totalCategoryQuantity = getCategoryTotalQuantity(items, removedProduct.category || '');
  
  if (totalCategoryQuantity > 0 && totalCategoryQuantity < categoryMOQ) {
    const remainingNeeded = categoryMOQ - totalCategoryQuantity;
    return {
      hasWarning: true,
      message: `You now need ${remainingNeeded} more units from the ${removedProduct.category} category to meet the minimum order of ${categoryMOQ} units.`
    };
  }
  
  return { hasWarning: false };
};

// New function to check if we should show MOQ warnings in UI
export const shouldShowCategoryMOQWarning = (
  items: CartItem[],
  product: Product
): { shouldShow: boolean; message?: string } => {
  const categoryMOQ = getCategoryMOQ(product.category || '');
  
  if (!categoryMOQ) {
    return { shouldShow: false };
  }
  
  // Only show warning if user already has items in cart for this category
  const currentCategoryQuantity = getCategoryTotalQuantity(items, product.category || '');
  
  if (currentCategoryQuantity > 0 && currentCategoryQuantity < categoryMOQ) {
    const remainingNeeded = categoryMOQ - currentCategoryQuantity;
    return {
      shouldShow: true,
      message: `You currently have ${currentCategoryQuantity} units from ${product.category}. You need ${remainingNeeded} more to meet the minimum of ${categoryMOQ} units.`
    };
  }
  
  return { shouldShow: false };
};
