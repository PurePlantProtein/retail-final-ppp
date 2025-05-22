
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

const EmptyCart = () => {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
        <p className="mb-6 text-gray-500 text-center max-w-md">
          Looks like you haven't added any products to your cart yet.
          Browse our collection to find what you're looking for.
        </p>
        <Button asChild size="lg">
          <Link to="/products">Browse Products</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCart;
