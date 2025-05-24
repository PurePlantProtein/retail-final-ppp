
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PricingTier } from '@/types/pricing';
import { useToast } from '@/components/ui/use-toast';

export const usePricingTiersList = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPricingTiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('discount_percentage', { ascending: false });

      if (error) throw error;
      setTiers(data as PricingTier[]);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing tiers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch pricing tiers on component mount
  useEffect(() => {
    fetchPricingTiers();
  }, [fetchPricingTiers]);

  return {
    tiers,
    isLoading,
    fetchPricingTiers,
  };
};
