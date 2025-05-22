
import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryDisplay } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';

interface CategoryCardProps {
  category: CategoryDisplay;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-gray-400">
            <Folder className="h-16 w-16 mb-2" />
            <span className="text-lg font-medium text-gray-600">{category.name}</span>
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <h3 className="text-xl font-semibold mb-2">
          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          asChild
          variant="outline" 
          className="w-full"
        >
          <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
            Browse Category
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
