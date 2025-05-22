
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ShippingForm from '@/components/ShippingForm';
import ShippingOptions from '@/components/ShippingOptions';
import { ShippingAddress, ShippingOption } from '@/types/product';

type ShippingStepProps = {
  shippingAddress: ShippingAddress | null;
  onShippingAddressSubmit: (address: ShippingAddress) => void;
  shippingOptions: ShippingOption[];
  selectedShippingOption?: string;
  onSelectShippingOption: (optionId: string) => void;
  isLoadingShippingOptions: boolean;
  onBackToCart: () => void;
  onContinueToPayment: () => void;
};

const ShippingStep = ({
  shippingAddress,
  onShippingAddressSubmit,
  shippingOptions,
  selectedShippingOption,
  onSelectShippingOption,
  isLoadingShippingOptions,
  onBackToCart,
  onContinueToPayment
}: ShippingStepProps) => {
  const [showShippingForm, setShowShippingForm] = useState(!shippingAddress);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
      </CardHeader>
      <CardContent>
        {shippingAddress && !showShippingForm ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">{shippingAddress.name}</p>
              <p>{shippingAddress.street}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
              <p>{shippingAddress.country}</p>
              <p>Phone: {shippingAddress.phone}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowShippingForm(true)}
            >
              Edit Address
            </Button>
          </div>
        ) : (
          <ShippingForm 
            onSubmit={(address) => {
              onShippingAddressSubmit(address);
              setShowShippingForm(false);
            }} 
            defaultValues={shippingAddress || undefined}
          />
        )}
        
        {shippingAddress && !showShippingForm && (
          <>
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Shipping Options</h3>
              <ShippingOptions 
                shippingOptions={shippingOptions}
                selectedOption={selectedShippingOption}
                onSelect={onSelectShippingOption}
                isLoading={isLoadingShippingOptions}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={onBackToCart}
              >
                Back to Cart
              </Button>
              <Button
                onClick={onContinueToPayment}
                disabled={!selectedShippingOption}
              >
                Continue to Payment
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingStep;
