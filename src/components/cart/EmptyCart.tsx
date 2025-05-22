
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EmptyCart = () => {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center py-16">
        <p className="mb-6 text-gray-500">Your cart is empty</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCart;
