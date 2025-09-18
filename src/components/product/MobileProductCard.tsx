import { formatCurrency } from '@/utils/formatters';

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import QuantityControls from './QuantityControls';

interface MobileProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onIncrementQuantity: (productId: string) => void;
  onDecrementQuantity: (productId: string) => void;
  onQuantityChange: (productId: string, value: string) => void;
  isLoggedIn: boolean;
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  onQuantityChange,
  isLoggedIn,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex-1">
              <Link 
                to={`/products/${product.id}`} 
                className="font-medium text-lg hover:text-primary transition-colors"
              >
                {product.name}
              </Link>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Category: {product.category?.name || 'Uncategorized'}</p>
                <p>Price: {formatCurrency(product.price as any)}</p>
                <p>Stock: {product.stock}</p>
              </div>
            </div>
          </div>
          
          {isLoggedIn && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <QuantityControls
                  productId={product.id}
                  quantity={quantity}
                  maxStock={product.stock}
                  onIncrement={onIncrementQuantity}
                  onDecrement={onDecrementQuantity}
                  onQuantityChange={onQuantityChange}
                />
              </div>
              <Button 
                onClick={() => onAddToCart(product)}
                className="w-full"
                size="sm"
              >
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
