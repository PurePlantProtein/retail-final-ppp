
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImageProps {
  image: string | null;
  name: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ image, name }) => {
  const fallbackImage = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallbackImage) {
      target.src = fallbackImage;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <img 
          src={image || fallbackImage} 
          alt={name}
          className="w-full h-auto object-cover aspect-square"
          onError={handleImageError}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImage;
