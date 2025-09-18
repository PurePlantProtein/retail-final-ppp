import { formatCurrency } from '@/utils/formatters';

import React from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Copy, Weight, DollarSign } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onManagePricing: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onManagePricing,
}) => {
  return (
    <Card key={product.id}>
      <div className="h-40 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <div className="flex justify-between">
          <span className="text-primary font-medium">{formatCurrency(product.price as any)}</span>
          <span className="text-gray-500 text-sm">Stock: {product.stock}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Weight className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {product.weight ? `${product.weight} kg` : 'Weight not specified'}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(product)}
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
            onClick={() => onDuplicate(product)}
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(product)}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
