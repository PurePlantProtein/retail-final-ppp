
import React from 'react';
import { ShippingOption } from '@/types/product';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface ShippingOptionsProps {
  shippingOptions: ShippingOption[];
  selectedOption: string | undefined;
  onSelect: (optionId: string) => void;
  isLoading: boolean;
}

const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  shippingOptions,
  selectedOption,
  onSelect,
  isLoading
}) => {
  console.log('Rendering ShippingOptions with:', { shippingOptions, selectedOption, isLoading });
  
  // Default free shipping option as fallback if API fails to load options
  const defaultFreeShipping: ShippingOption = {
    id: 'free-shipping',
    name: 'Free Shipping',
    price: 0.00,
    description: 'Delivery in 5-7 business days',
    estimatedDeliveryDays: 7,
    carrier: 'Australia Post'
  };
  
  // Use available options or fallback to default
  const displayOptions = (shippingOptions && shippingOptions.length > 0) 
    ? shippingOptions 
    : [defaultFreeShipping];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Calculating shipping options...</span>
      </div>
    );
  }

  return (
    <RadioGroup 
      value={selectedOption} 
      onValueChange={onSelect}
      className="space-y-3"
    >
      {displayOptions.map((option) => (
        <div 
          key={option.id} 
          className={`flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent ${
            option.id === selectedOption ? 'border-primary bg-primary/5' : ''
          } ${
            option.id === 'free-shipping' ? 'border-green-500 bg-green-50' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <div>
              <Label htmlFor={option.id} className="text-base font-medium cursor-pointer flex items-center">
                {option.name}
                {option.price === 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    FREE
                  </span>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
              <p className="text-sm">
                Estimated delivery: {option.estimatedDeliveryDays} days
              </p>
              <div className="flex items-center text-xs mt-1">
                <span className="inline-block h-3 w-3 rounded-full mr-1 bg-red-500"></span>
                <span className="capitalize">
                  {option.carrier}
                </span>
              </div>
            </div>
          </div>
          <div className="font-medium">
            {option.price > 0 ? `$${option.price.toFixed(2)}` : (
              <span className="text-green-600 font-bold">FREE</span>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};

export default ShippingOptions;
