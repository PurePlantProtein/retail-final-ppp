
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PricingTier } from '@/types/pricing';
import { useToast } from '@/components/ui/use-toast';

export const usePricingTierActions = (onSuccess?: () => Promise<void>) => {
  const { toast } = useToast();

  const createPricingTier = useCallback(async (tierData: Partial<PricingTier>) => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .insert(tierData as any)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Pricing tier created',
        description: `${tierData.name} tier has been created successfully.`,
      });
      
      if (onSuccess) await onSuccess();
      return data as PricingTier;
    } catch (error) {
      console.error('Error creating pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pricing tier.',
        variant: 'destructive',
      });
      return null;
    }
  }, [onSuccess, toast]);

  const updatePricingTier = useCallback(async (id: string, tierData: Partial<PricingTier>) => {
    try {
      const { error } = await supabase
        .from('pricing_tiers')
        .update(tierData as any)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Pricing tier updated',
        description: 'The pricing tier has been updated successfully.',
      });
      
      if (onSuccess) await onSuccess();
      return true;
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing tier.',
        variant: 'destructive',
      });
      return false;
    }
  }, [onSuccess, toast]);

  const deletePricingTier = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('pricing_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Pricing tier deleted',
        description: 'The pricing tier has been deleted successfully.',
      });
      
      if (onSuccess) await onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing tier.',
        variant: 'destructive',
      });
      return false;
    }
  }, [onSuccess, toast]);

  return {
    createPricingTier,
    updatePricingTier,
    deletePricingTier
  };
};
