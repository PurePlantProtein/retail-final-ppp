
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ShippingForm from '@/components/ShippingForm';

type ShippingAddressCardProps = {
  shippingAddress: any;
  onSubmit: (data: any) => void;
};

const ShippingAddressCard: React.FC<ShippingAddressCardProps> = ({ shippingAddress, onSubmit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Default Shipping Address</CardTitle>
        <CardDescription>
          Manage your default shipping address for faster checkout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ShippingForm 
          onSubmit={onSubmit} 
          defaultValues={shippingAddress || undefined}
        />
      </CardContent>
    </Card>
  );
};

export default ShippingAddressCard;
