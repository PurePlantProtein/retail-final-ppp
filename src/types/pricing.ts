
export type PricingTier = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type UserPricingTier = {
  id: string;
  user_id: string;
  tier_id: string;
  created_at: string;
  updated_at: string;
  tier?: PricingTier;
};

export type ProductPrice = {
  id: string;
  product_id: string;
  tier_id: string;
  price: number;
  created_at: string;
  updated_at: string;
};

// Helper function to get the price for a specific product and tier
export const getProductTierPrice = (
  productPrices: ProductPrice[],
  productId: string,
  tierId: string | undefined
): number | null => {
  if (!tierId) return null;
  
  const productPrice = productPrices.find(
    pp => pp.product_id === productId && pp.tier_id === tierId
  );
  
  return productPrice ? productPrice.price : null;
};

// Helper function to calculate the effective price (tier price or base price)
export const calculateEffectivePrice = (
  basePrice: number,
  tierPrice: number | null
): number => {
  return tierPrice !== null ? tierPrice : basePrice;
};
