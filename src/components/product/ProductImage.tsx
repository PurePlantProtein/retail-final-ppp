
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImageProps {
  image: string | null;
  name: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ image, name }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <img 
          src={image} 
          alt={name}
          className="w-full h-auto object-cover aspect-square"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImage;
