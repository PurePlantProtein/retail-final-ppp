
import React from 'react';
import ProductSpecifications from './ProductSpecifications';
import { Product } from '@/types/product';

interface ProductSpecificationsWrapperProps {
  product: Product;
}

const ProductSpecificationsWrapper: React.FC<ProductSpecificationsWrapperProps> = ({ product }) => {
  return (
    <ProductSpecifications
      stock={product.stock}
      servingSize={product.servingSize}
      numberOfServings={product.numberOfServings}
      bagSize={product.bagSize}
    />
  );
};

export default ProductSpecificationsWrapper;
