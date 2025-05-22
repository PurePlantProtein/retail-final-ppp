
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
          className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent"
        >
          <div className="flex items-start gap-4">
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <div>
              <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                {option.name}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
              <p className="text-sm">
                Estimated delivery: {option.estimatedDeliveryDays}
              </p>
              <div className="flex items-center text-xs mt-1">
                <span className={`inline-block h-3 w-3 rounded-full mr-1 ${
                  option.carrier === 'australia-post' ? 'bg-red-500' : 'bg-blue-500'
                }`}></span>
                <span className="capitalize">
                  {option.carrier === 'australia-post' ? 'Australia Post' : 'Transdirect'}
                </span>
              </div>
            </div>
          </div>
          <div className="font-medium">
            ${option.price.toFixed(2)}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};

export default ShippingOptions;
