
import { useState } from 'react';
import { Product } from '@/types/product';

export function useProductQuantities(products: Product[]) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    products.reduce((acc, product) => ({
      ...acc,
      [product.id]: 1
    }), {})
  );

  const handleIncrementQuantity = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const handleDecrementQuantity = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 1) {
      setQuantities(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  return {
    quantities,
    handleIncrementQuantity,
    handleDecrementQuantity,
    handleQuantityChange,
  };
}
