
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPricingTier } from '@/types/pricing';
import { useToast } from '@/components/ui/use-toast';

export const useUserPricingTier = (userId: string | undefined) => {
  const [userTier, setUserTier] = useState<UserPricingTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserTier = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_pricing_tiers')
        .select('*, tier:pricing_tiers(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setUserTier(data as UserPricingTier);
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
