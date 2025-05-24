
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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  // Set up property aliases for cleaner code
  useEffect(() => {
    if (product) {
      // Add the camelCase aliases to make the code easier to work with
      product.minQuantity = product.min_quantity;
      product.bagSize = product.bag_size;
      product.numberOfServings = product.number_of_servings;
      product.servingSize = product.serving_size;
      product.aminoAcidProfile = product.amino_acid_profile as any;
      product.nutritionalInfo = product.nutritional_info as any;
    }
  }, [product]);

  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

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
                target.src = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
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
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 space-y-3 border-t">
        <div className="flex justify-between items-center w-full">
          <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
        </div>
        
        {user ? (
          <>
            <div className="flex items-center space-x-2 w-full">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDecrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input 
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
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
              disabled={quantity < 1 || quantity > product.stock}
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
