
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CartItem from './CartItem';
import { Product } from '@/types/product';

type CartItemListProps = {
  items: Array<{ product: Product; quantity: number }>;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
};

const CartItemList = ({ 
  items, 
  onRemoveItem, 
  onUpdateQuantity, 
  onClearCart 
}: CartItemListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="mb-6 text-gray-500">Your cart is empty</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // Wrapper function to ensure we're passing the correct product ID
  const handleRemoveItem = (productId: string) => {
    onRemoveItem(productId);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.product.id}
          product={item.product}
          quantity={item.quantity}
          onRemove={handleRemoveItem}
          onUpdateQuantity={onUpdateQuantity}
        />
      ))}
      
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={onClearCart}
        >
          Clear Cart
        </Button>
        <Button asChild variant="ghost">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default CartItemList;
