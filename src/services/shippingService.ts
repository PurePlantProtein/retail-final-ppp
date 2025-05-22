
import { ShippingOption, OrderItem } from '@/types/product';

// Define standard shipping options
export const standardShippingOptions: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 10.00,
    description: 'Delivery in 3-5 business days',
    estimatedDeliveryDays: 5,
    carrier: 'Australia Post'
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 20.00,
    description: 'Delivery in 1-2 business days',
    estimatedDeliveryDays: 2,
    carrier: 'Australia Post Express'
  },
  {
    id: 'priority',
    name: 'Priority Shipping',
    price: 30.00,
    description: 'Next business day delivery',
    estimatedDeliveryDays: 1,
    carrier: 'DHL Express'
  }
];

// Define regional shipping surcharges
const regionalSurcharges: Record<string, number> = {
  'NT': 15.00,  // Northern Territory
  'WA': 12.00,  // Western Australia
  'TAS': 10.00, // Tasmania
  'QLD': 5.00,  // Queensland (for distant areas)
};

/**
 * Calculate shipping options based on weight and destination
 */
export const calculateShippingOptions = async (
  totalWeight: number,
  destination: { postalCode: string; state: string },
  items: OrderItem[] = []
): Promise<ShippingOption[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Check for free shipping eligibility (orders over $150)
    const orderSubtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const qualifiesForFreeShipping = orderSubtotal >= 150;
    
    // Regional surcharge based on state
    const stateSurcharge = regionalSurcharges[destination.state] || 0;
    
    // Weight-based price adjustment (per kg over 5kg)
    const extraWeightCharge = Math.max(0, totalWeight - 5) * 2;
    
    // Calculate final shipping options
    const calculatedOptions = standardShippingOptions.map(option => ({
      ...option,
      price: qualifiesForFreeShipping && option.id === 'standard' 
        ? 0 
        : option.price + stateSurcharge + extraWeightCharge
    }));
    
    // Add free shipping option if qualified
    if (qualifiesForFreeShipping) {
      calculatedOptions.find(option => option.id === 'standard')!.name = 'Free Shipping';
      calculatedOptions.find(option => option.id === 'standard')!.description += ' (Free with orders over $150)';
    }
    
    return calculatedOptions;
  } catch (error) {
    console.error("Error calculating shipping options:", error);
    return standardShippingOptions; // Fallback to standard options
  }
};

/**
 * Get available shipping options for a postal code
 */
export const getShippingOptions = async (postalCode: string): Promise<ShippingOption[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get state from postal code (simple demonstration)
  const state = getStateFromPostal(postalCode);
  
  return calculateShippingOptions(1, { postalCode, state });
};

/**
 * Convert postal code to state (simplified mapping for Australia)
 */
const getStateFromPostal = (postalCode: string): string => {
  const prefix = postalCode.substring(0, 1);
  
  // Simplified mapping
  const mapping: Record<string, string> = {
    '0': 'NT',  // 0800-0899
    '1': 'NSW', // 1000-1999
    '2': 'NSW', // 2000-2999
    '3': 'VIC', // 3000-3999
    '4': 'QLD', // 4000-4999
    '5': 'SA',  // 5000-5999
    '6': 'WA',  // 6000-6999
    '7': 'TAS', // 7000-7999
  };
  
  return mapping[prefix] || 'NSW'; // Default to NSW
};
