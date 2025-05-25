
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEditProduct}
          onDelete={onDeletePrompt}
          onDuplicate={onDuplicateProduct}
          onManagePricing={onManagePricing}
        />
      ))}
    </div>
  );
};

export default ProductsList;
