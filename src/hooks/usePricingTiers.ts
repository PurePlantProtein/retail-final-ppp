
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PricingTier, UserPricingTier } from '@/types/pricing';
import { useToast } from '@/components/ui/use-toast';

export const usePricingTiers = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPricingTiers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use type casting to work around type issues with Supabase client
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('discount_percentage', { ascending: false });

      if (error) throw error;
      // Cast the data to the correct type
      setTiers((data as unknown) as PricingTier[]);
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

  const createPricingTier = useCallback(async (tierData: Partial<PricingTier>) => {
    try {
      // Use type casting to work around type issues with Supabase client
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
      
      fetchPricingTiers();
      return (data as unknown) as PricingTier;
    } catch (error) {
      console.error('Error creating pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pricing tier.',
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchPricingTiers, toast]);

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
      
      fetchPricingTiers();
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
  }, [fetchPricingTiers, toast]);

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
      
      fetchPricingTiers();
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
  }, [fetchPricingTiers, toast]);

  // Fetch pricing tiers on component mount
  useEffect(() => {
    fetchPricingTiers();
  }, [fetchPricingTiers]);

  return {
    tiers,
    isLoading,
    fetchPricingTiers,
    createPricingTier,
    updatePricingTier,
    deletePricingTier
  };
};

export const useUserPricingTier = (userId: string | undefined) => {
  const [userTier, setUserTier] = useState<UserPricingTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserTier = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Use type casting to work around type issues with Supabase client
      const { data, error } = await supabase
        .from('user_pricing_tiers')
        .select('*, tier:pricing_tiers(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setUserTier((data as unknown) as UserPricingTier);
    } catch (error) {
      console.error('Error fetching user pricing tier:', error);
      setUserTier(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserTier();
  }, [fetchUserTier]);

  const assignUserTier = useCallback(async (tierId: string) => {
    if (!userId) return false;
    
    try {
      // Check if user already has a tier
      if (userTier) {
        // Update existing tier
        const { error } = await supabase
          .from('user_pricing_tiers')
          .update({ tier_id: tierId } as any)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new user tier
        const { error } = await supabase
          .from('user_pricing_tiers')
          .insert({ user_id: userId, tier_id: tierId } as any);
        
        if (error) throw error;
      }
      
      toast({
        title: 'Pricing tier assigned',
        description: 'The pricing tier has been assigned to the user.',
      });
      
      fetchUserTier();
      return true;
    } catch (error) {
      console.error('Error assigning pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign pricing tier to user.',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, userTier, fetchUserTier, toast]);

  const removeUserTier = useCallback(async () => {
    if (!userId || !userTier) return false;
    
    try {
      const { error } = await supabase
        .from('user_pricing_tiers')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Pricing tier removed',
        description: 'The pricing tier has been removed from the user.',
      });
      
      setUserTier(null);
      return true;
    } catch (error) {
      console.error('Error removing pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove pricing tier from user.',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, userTier, toast]);

  return {
    userTier,
    isLoading,
    fetchUserTier,
    assignUserTier,
    removeUserTier
  };
};
