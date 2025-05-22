
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(product.minQuantity);

  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrementQuantity = () => {
    if (quantity > product.minQuantity) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= product.minQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="relative pt-4 px-4 flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="h-56 object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardHeader className="pb-2">
        <Link to={`/products/${product.id}`}>
          <CardTitle className="text-lg hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-gray-500 text-sm">Min order: {product.minQuantity} units</p>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 space-y-3 border-t">
        <div className="flex justify-between items-center w-full">
          <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{product.stock} available</p>
        </div>
        
        {user ? (
          <>
            <div className="flex items-center space-x-2 w-full">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDecrementQuantity}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input 
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={product.minQuantity}
                max={product.stock}
                className="h-8 text-center"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleIncrementQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button 
              onClick={handleAddToCart} 
              className="w-full"
              disabled={quantity < product.minQuantity || quantity > product.stock}
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
