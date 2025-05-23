
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Calculating shipping options...</span>
      </div>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No shipping options available for your location.
      </div>
    );
  }

  return (
    <RadioGroup 
      value={selectedOption} 
      onValueChange={onSelect}
      className="space-y-3"
    >
      {shippingOptions.map((option) => (
        <div 
          key={option.id} 
          className={`flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent ${
            option.id === 'free-shipping' ? 'border-green-500 bg-green-50' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <div>
              <Label htmlFor={option.id} className="text-base font-medium cursor-pointer flex items-center">
                {option.name}
                {option.id === 'free-shipping' && (
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
