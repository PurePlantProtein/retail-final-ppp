import { formatCurrency } from '@/utils/formatters';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { ShippingOption } from '@/types/product';

type OrderSummaryProps = {
  subtotal: number;
  selectedShippingOption?: ShippingOption;
  checkoutStep: 'cart' | 'shipping' | 'payment';
  onProceedToShipping: () => void;
};

const OrderSummary = ({ 
  subtotal, 
  selectedShippingOption, 
  checkoutStep, 
  onProceedToShipping 
}: OrderSummaryProps) => {
  const shippingCost = selectedShippingOption?.price || 0;
  const totalWithShipping = subtotal + shippingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          {selectedShippingOption ? (
            <span>{formatCurrency(selectedShippingOption.price as any)}</span>
          ) : (
            <span className="text-muted-foreground">
              {checkoutStep === 'cart' ? 'Calculated at checkout' : 'Select shipping option'}
            </span>
          )}
        </div>
        <Separator />
        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>{formatCurrency(totalWithShipping)}</span>
        </div>
        
        {checkoutStep === 'cart' && (
          <Button 
            className="w-full mt-4" 
            onClick={onProceedToShipping}
          >
            <Truck className="mr-2 h-4 w-4" /> Proceed to Shipping
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex-col">
        <p className="text-xs text-gray-500 mt-2 text-center">
          Secure checkout powered by Bank Transfer
        </p>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
