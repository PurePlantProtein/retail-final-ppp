
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LoginRequired = () => {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center py-16">
        <p className="mb-6 text-gray-500">Please log in to view your cart</p>
        <div className="flex space-x-4">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginRequired;
