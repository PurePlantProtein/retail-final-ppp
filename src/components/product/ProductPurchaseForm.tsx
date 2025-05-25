
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getProductTierPrice, calculateEffectivePrice } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';

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
  discountPercentage?: number;
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
  categoryMOQ,
}) => {
  const [effectivePrice, setEffectivePrice] = useState(price);
  const [userTier, setUserTier] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Determine the effective minimum quantity (product-specific or category-based)
  const effectiveMinQuantity = categoryMOQ || minQuantity || 1;

  useEffect(() => {
    if (user) {
      fetchUserTierAndPrice();
    }
  }, [user]);

  const fetchUserTierAndPrice = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's pricing tier
      const { data: userTierData } = await supabase
        .from('user_pricing_tiers')
        .select(`
          *,
          tier:pricing_tiers(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (userTierData) {
        setUserTier(userTierData);
        
        // Get product price for this tier
        const { data: productPrices } = await supabase
          .from('product_prices')
          .select('*')
          .eq('product_id', window.location.pathname.split('/').pop()) // Get product ID from URL
          .eq('tier_id', userTierData.tier_id);

        if (productPrices && productPrices.length > 0) {
          setEffectivePrice(productPrices[0].price);
        }
      }
    } catch (error) {
      console.error('Error fetching user tier and pricing:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const savings = price !== effectivePrice ? (price - effectivePrice) * quantity : 0;

  return (
    <div className="border-t pt-4 sm:pt-6">
      {user ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDecrementQuantity}
                disabled={quantity <= effectiveMinQuantity}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={effectiveMinQuantity}
                max={stock}
                className="w-16 sm:w-20 mx-2 text-center h-9 sm:h-10"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleIncrementQuantity}
                disabled={quantity >= stock}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {categoryMOQ && (
            <div className="mb-4 text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-md">
              * Minimum order: {effectiveMinQuantity} units for {category} products
            </div>
          )}
          
          {userTier && effectivePrice !== price && (
            <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-md">
              * Special pricing applied ({userTier.tier?.name} tier)
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Button 
              size="lg"
              onClick={handleAddToCart}
              disabled={quantity < effectiveMinQuantity || quantity > stock || loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Add to Cart'}
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/cart">View Cart</Link>
            </Button>
          </div>
          
          {quantity > 0 && (
            <div className="mt-4 text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md">
              <p className="font-medium">
                Total: ${(effectivePrice * quantity).toFixed(2)}
                {savings > 0 && (
                  <span className="ml-2 text-green-600">
                    (Saved: ${savings.toFixed(2)})
                  </span>
                )}
              </p>
              {effectivePrice !== price && (
                <p className="text-xs text-gray-500">
                  Base price: ${(price * quantity).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col space-y-3">
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Please log in to purchase this product.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link to="/login">Login to Purchase</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductPurchaseForm;
