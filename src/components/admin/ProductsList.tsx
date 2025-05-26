
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Copy, DollarSign } from 'lucide-react';

interface ProductsListProps {
  products: Product[];
  loading: boolean;
  onEditProduct: (product: Product) => void;
  onDeletePrompt: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onManagePricing: (product: Product) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  loading,
  onEditProduct,
  onDeletePrompt,
  onDuplicateProduct,
  onManagePricing,
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No products found.</p>
      </div>
    );
  }

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
            <TableHead>Weight</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                </div>
              </TableCell>
              <TableCell>{product.category || '-'}</TableCell>
              <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.weight ? `${product.weight} kg` : '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditProduct(product)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => onManagePricing(product)}
                    className="flex items-center gap-1"
                  >
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => onDuplicateProduct(product)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeletePrompt(product)}
                    className="flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsList;
