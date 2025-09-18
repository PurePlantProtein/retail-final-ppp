import { formatCurrency } from '@/utils/formatters';

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product';

type CartItemProps = {
  product: Product;
  quantity: number;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
};

const CartItem = ({ product, quantity, onRemove, onUpdateQuantity }: CartItemProps) => {
  return (
    <Card key={product.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Link 
            to={`/products/${product.id}`}
            className="sm:w-1/4 flex-shrink-0"
          >
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-36 sm:h-full object-cover"
            />
          </Link>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <Link 
                to={`/products/${product.id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {product.name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() => onRemove(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-gray-600 text-sm my-2 line-clamp-2">
              {product.description}
            </p>
            
            <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                  disabled={quantity <= (product.minQuantity || 0)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input 
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      onUpdateQuantity(product.id, value);
                    }
                  }}
                  className="w-16 h-8 text-center mx-2"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-medium">
                    {formatCurrency(((typeof product.price === 'string' ? parseFloat(product.price) : product.price) || 0) * (Number(quantity) || 0))}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(product.price as any)} each
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
