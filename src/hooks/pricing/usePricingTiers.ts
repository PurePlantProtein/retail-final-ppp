
import { usePricingTiersList } from './usePricingTiersList';
import { usePricingTierActions } from './usePricingTierActions';

export const usePricingTiers = () => {
  const { tiers, isLoading, fetchPricingTiers } = usePricingTiersList();
  const { createPricingTier, updatePricingTier, deletePricingTier } = usePricingTierActions(fetchPricingTiers);

  return {
    tiers,
    isLoading,
    fetchPricingTiers,
    createPricingTier,
    updatePricingTier,
    deletePricingTier
  };
};

// Re-export useUserPricingTier for backward compatibility
export { useUserPricingTier } from './useUserPricingTier';
