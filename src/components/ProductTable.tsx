
import React from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductQuantities } from '@/hooks/useProductQuantities';
import MobileProductCard from './product/MobileProductCard';
import DesktopProductTable from './product/DesktopProductTable';

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isMobile = useIsMobile();
  const {
    quantities,
    handleIncrementQuantity,
    handleDecrementQuantity,
    handleQuantityChange,
  } = useProductQuantities(products);

  const handleAddToCart = (product: Product) => {
    addToCart(product, quantities[product.id] || 1);
  };

  const handleAddAllToCart = () => {
    products.forEach(product => {
      const quantity = quantities[product.id];
      if (quantity > 0) {
        addToCart(product, quantity);
      }
    });
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 1}
            onAddToCart={handleAddToCart}
            onIncrementQuantity={handleIncrementQuantity}
            onDecrementQuantity={handleDecrementQuantity}
            onQuantityChange={handleQuantityChange}
            isLoggedIn={!!user}
          />
        ))}
        
        {user && (
          <div className="sticky bottom-4 z-10">
            <Button 
              onClick={handleAddAllToCart}
              className="w-full flex items-center gap-2 shadow-lg"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Add All to Cart
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DesktopProductTable
        products={products}
        quantities={quantities}
        onAddToCart={handleAddToCart}
        onIncrementQuantity={handleIncrementQuantity}
        onDecrementQuantity={handleDecrementQuantity}
        onQuantityChange={handleQuantityChange}
        isLoggedIn={!!user}
      />
      
      {user && (
        <div className="flex justify-end">
          <Button 
            onClick={handleAddAllToCart}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add All to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
