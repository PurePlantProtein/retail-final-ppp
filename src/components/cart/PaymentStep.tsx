import { formatCurrency } from '@/utils/formatters';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard } from 'lucide-react';
import { ShippingAddress, ShippingOption } from '@/types/product';

type PaymentStepProps = {
  shippingAddress: ShippingAddress;
  selectedOption: ShippingOption | undefined;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    reference: string;
  };
  isProcessingOrder: boolean;
  onBackToShipping: () => void;
  onCompleteOrder: () => void;
  onEditShipping: () => void;
};

const PaymentStep = ({
  shippingAddress,
  selectedOption,
  bankDetails,
  isProcessingOrder,
  onBackToShipping,
  onCompleteOrder,
  onEditShipping
}: PaymentStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="shipping">
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping Address</AccordionTrigger>
            <AccordionContent>
              {shippingAddress && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">{shippingAddress.name}</p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>Phone: {shippingAddress.phone}</p>
                </div>
              )}
              <Button 
                variant="link"
                onClick={onEditShipping}
                className="mt-2 px-0"
              >
                Edit
              </Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping-method">
            <AccordionTrigger>Shipping Method</AccordionTrigger>
            <AccordionContent>
              {selectedOption && (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{selectedOption.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOption.description}
                      </p>
                      <p className="text-sm">
                        Estimated delivery: {selectedOption.estimatedDeliveryDays}
                      </p>
                      <div className="flex items-center text-xs mt-1">
                        <span className={`inline-block h-3 w-3 rounded-full mr-1 ${
                          selectedOption.carrier === 'australia-post' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></span>
                        <span className="capitalize">
                          {selectedOption.carrier === 'australia-post' ? 'Australia Post' : 'Transdirect'}
                        </span>
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(selectedOption.price as any)}
                    </div>
                  </div>
                </div>
              )}
              <Button 
                variant="link"
                onClick={onEditShipping}
                className="mt-2 px-0"
              >
                Change
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Bank Details</p>
            <div className="space-y-1.5 text-sm">
              <p><span className="font-medium">Bank:</span> Suncorp Bank</p>
              <p><span className="font-medium">Account Name:</span> JMP Foods Pty Ltd</p>
              <p><span className="font-medium">BSB:</span> 484-799</p>
              <p><span className="font-medium">Account:</span> 611680986</p>
              <p><span className="font-medium">Reference:</span> {bankDetails.reference}</p>
              <p className="text-xs text-muted-foreground mt-2">You'll also receive an invoice from XERO.</p>
            </div>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={onCompleteOrder}
            disabled={isProcessingOrder}
          >
            {isProcessingOrder ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" /> Complete Order
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Include the reference number when making your bank transfer
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onBackToShipping}
          className="mt-6"
          disabled={isProcessingOrder}
        >
          Back to Shipping
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
