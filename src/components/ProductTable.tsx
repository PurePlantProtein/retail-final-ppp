
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[200px]">Quantity</TableHead>
              {user && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link to={`/products/${product.id}`} className="hover:underline text-primary">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>{product.category || '-'}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDecrementQuantity(product.id)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input 
                        type="number"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        min="1"
                        max={product.stock}
                        className="h-8 w-16 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleIncrementQuantity(product.id)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
                {user && (
                  <TableCell className="text-right">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
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
