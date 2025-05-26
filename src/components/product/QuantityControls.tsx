
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface QuantityControlsProps {
  productId: string;
  quantity: number;
  maxStock: number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onQuantityChange: (productId: string, value: string) => void;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  productId,
  quantity,
  maxStock,
  onIncrement,
  onDecrement,
  onQuantityChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onDecrement(productId)}
        className="h-8 w-8"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input 
        type="number"
        value={quantity}
        onChange={(e) => onQuantityChange(productId, e.target.value)}
        min="1"
        max={maxStock}
        className="h-8 w-16 text-center"
      />
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onIncrement(productId)}
        className="h-8 w-8"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantityControls;
