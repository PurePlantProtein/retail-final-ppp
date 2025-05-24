
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProductPurchaseFormProps {
  user: any;
  price: number;
  stock: number;
  quantity: number;
  category: string;
  handleIncrementQuantity: () => void;
  handleDecrementQuantity: () => void;
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddToCart: () => void;
  minQuantity?: number;
  categoryMOQ?: number;
}

const ProductPurchaseForm: React.FC<ProductPurchaseFormProps> = ({
  user,
  price,
  stock,
  quantity,
  category,
  handleIncrementQuantity,
  handleDecrementQuantity,
  handleQuantityChange,
  handleAddToCart,
  minQuantity = 1,
  categoryMOQ
}) => {
  // Determine the effective minimum quantity (product-specific or category-based)
  const effectiveMinQuantity = categoryMOQ || minQuantity || 1;

  // Show warning if the quantity is below the minimum
  useEffect(() => {
    if (quantity < effectiveMinQuantity) {
      toast({
        title: "Minimum order quantity",
        description: `This ${category} requires a minimum order of ${effectiveMinQuantity} units.`,
        variant: "default"
      });
    }
  }, []);

  return (
    <div className="border-t pt-6">
      {user ? (
        <>
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-gray-700">Quantity:</span>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDecrementQuantity}
                disabled={quantity <= effectiveMinQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={effectiveMinQuantity}
                max={stock}
                className="w-20 mx-2 text-center"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleIncrementQuantity}
                disabled={quantity >= stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {categoryMOQ && (
            <div className="mb-4 text-sm text-amber-600 font-medium">
              * Minimum order: {effectiveMinQuantity} units for {category} products
            </div>
          )}
          <div className="flex flex-col space-y-3">
            <Button 
              size="lg"
              onClick={handleAddToCart}
              disabled={quantity < effectiveMinQuantity || quantity > stock}
            >
              Add to Cart
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/cart">View Cart</Link>
            </Button>
          </div>
          {quantity > 0 && (
            <p className="mt-4 text-sm text-gray-600 text-left">
              Total: ${(price * quantity).toFixed(2)}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col space-y-3">
          <p className="text-gray-600 mb-2 text-left">
            Please log in to purchase this product.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Login to Purchase</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductPurchaseForm;
