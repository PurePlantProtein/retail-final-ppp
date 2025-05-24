
import React from 'react';

interface ProductSpecificationsProps {
  stock: number;
  servingSize?: string | null;
  numberOfServings?: number | null;
  bagSize?: string | null;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  stock,
  servingSize,
  numberOfServings,
  bagSize
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div>
        <h4 className="text-sm text-gray-500">Available Stock</h4>
        <p className="text-left">{stock} units</p>
      </div>
      
      {servingSize && (
        <div>
          <h4 className="text-sm text-gray-500">Serving Size</h4>
          <p className="text-left">{servingSize}</p>
        </div>
      )}
      
      {numberOfServings !== undefined && (
        <div>
          <h4 className="text-sm text-gray-500">Number of Servings</h4>
          <p className="text-left">{numberOfServings}</p>
        </div>
      )}
      
      {bagSize && (
        <div>
          <h4 className="text-sm text-gray-500">Bag Size</h4>
          <p className="text-left">{bagSize}</p>
        </div>
      )}
    </div>
  );
};

export default ProductSpecifications;
