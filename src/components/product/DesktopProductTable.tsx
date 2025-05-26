
import React from 'react';
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
import { Product } from '@/types/product';
import QuantityControls from './QuantityControls';

interface DesktopProductTableProps {
  products: Product[];
  quantities: Record<string, number>;
  onAddToCart: (product: Product) => void;
  onIncrementQuantity: (productId: string) => void;
  onDecrementQuantity: (productId: string) => void;
  onQuantityChange: (productId: string, value: string) => void;
  isLoggedIn: boolean;
}

const DesktopProductTable: React.FC<DesktopProductTableProps> = ({
  products,
  quantities,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  onQuantityChange,
  isLoggedIn,
}) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="w-[200px]">Quantity</TableHead>
            {isLoggedIn && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link to={`/products/${product.id}`} className="hover:underline text-primary">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell>{product.category || '-'}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {isLoggedIn ? (
                  <QuantityControls
                    productId={product.id}
                    quantity={quantities[product.id] || 1}
                    maxStock={product.stock}
                    onIncrement={onIncrementQuantity}
                    onDecrement={onDecrementQuantity}
                    onQuantityChange={onQuantityChange}
                  />
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              {isLoggedIn && (
                <TableCell className="text-right">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToCart(product)}
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
  );
};

export default DesktopProductTable;
