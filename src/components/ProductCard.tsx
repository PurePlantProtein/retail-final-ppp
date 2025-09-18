
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Minus } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { useUserPricingTier } from '@/hooks/usePricingTiers';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { userTier } = useUserPricingTier(user?.id);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);

  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrementQuantity = () => {
  const minQty = product.minQuantity || 1;
    if (quantity > minQty) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
  const minQty = product.minQuantity || 1;
    if (!isNaN(value) && value >= minQty) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const minQty = product.minQuantity || 1;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="p-4">
          <AspectRatio ratio={1/1} className="bg-white rounded-md overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </AspectRatio>
        </div>
      </Link>
      <CardHeader className="pb-2">
        <Link to={`/products/${product.id}`}>
          <CardTitle className="text-lg hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-gray-500 text-sm">In stock: {product.stock} units</p>
        {minQty > 1 && (
          <p className="text-amber-600 text-sm">Min order: {minQty} units</p>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 space-y-3 border-t">
        <div className="flex justify-between items-center w-full gap-2">
          <p className="font-bold text-lg">{formatCurrency(product.price as any)}</p>
          {user && userTier?.tier?.name && (
            <Badge variant="outline" className="ml-auto whitespace-nowrap">{userTier.tier.name} tier</Badge>
          )}
        </div>
        
        {user ? (
          <>
            <div className="flex items-center space-x-2 w-full">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDecrementQuantity}
                disabled={quantity <= minQty}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input 
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={minQty}
                max={product.stock}
                className="h-8 text-center"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleIncrementQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button 
              onClick={handleAddToCart} 
              className="w-full"
              disabled={quantity < minQty || quantity > product.stock}
            >
              Add to Cart
            </Button>
          </>
        ) : (
          <Button asChild className="w-full">
            <Link to="/login">Login to Purchase</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
