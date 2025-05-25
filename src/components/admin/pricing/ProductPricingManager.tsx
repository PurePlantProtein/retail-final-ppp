
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { PricingTier, ProductPrice } from '@/types/pricing';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductPricingManagerProps {
  product: Product;
  tiers: PricingTier[];
  onClose: () => void;
}

const ProductPricingManager: React.FC<ProductPricingManagerProps> = ({
  product,
  tiers,
  onClose
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProductPrices();
  }, [product.id]);

  const fetchProductPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('product_prices')
        .select('*')
        .eq('product_id', product.id);

      if (error) throw error;

      setProductPrices(data || []);
      
      // Initialize price inputs
      const inputs: Record<string, string> = {};
      tiers.forEach(tier => {
        const existingPrice = data?.find(p => p.tier_id === tier.id);
        inputs[tier.id] = existingPrice ? existingPrice.price.toString() : '';
      });
      setPriceInputs(inputs);
    } catch (error) {
      console.error('Error fetching product prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product prices.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (tierId: string, value: string) => {
    setPriceInputs(prev => ({
      ...prev,
      [tierId]: value
    }));
  };

  const saveProductPrices = async () => {
    setSaving(true);
    try {
      // Delete existing prices for this product
      const { error: deleteError } = await supabase
        .from('product_prices')
        .delete()
        .eq('product_id', product.id);

      if (deleteError) throw deleteError;

      // Insert new prices
      const newPrices = Object.entries(priceInputs)
        .filter(([_, price]) => price.trim() !== '')
        .map(([tierId, price]) => ({
          product_id: product.id,
          tier_id: tierId,
          price: parseFloat(price)
        }));

      if (newPrices.length > 0) {
        const { error: insertError } = await supabase
          .from('product_prices')
          .insert(newPrices);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Product prices updated successfully.',
      });

      onClose();
    } catch (error) {
      console.error('Error saving product prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product prices.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading pricing information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Set Prices for "{product.name}"
        </CardTitle>
        <p className="text-sm text-gray-600">
          Base Price: ${product.price.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isMobile ? (
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div key={tier.id} className="space-y-2">
                  <div>
                    <h4 className="font-medium">{tier.name}</h4>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={priceInputs[tier.id] || ''}
                    onChange={(e) => handlePriceChange(tier.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>{tier.description}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        value={priceInputs[tier.id] || ''}
                        onChange={(e) => handlePriceChange(tier.id, e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={saveProductPrices} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Prices'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricingManager;
