
export type PricingTier = {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
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

// Helper function to calculate tiered price
export const calculateTieredPrice = (
  basePrice: number, 
  discountPercentage: number | undefined
): number => {
  if (!discountPercentage) return basePrice;
  const discount = basePrice * (discountPercentage / 100);
  return basePrice - discount;
};
