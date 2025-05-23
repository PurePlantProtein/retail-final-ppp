
import { ShippingOption, OrderItem } from '@/types/product';

// Define only free shipping option
export const standardShippingOptions: ShippingOption[] = [
  {
    id: 'free-shipping',
    name: 'Free Shipping',
    price: 0.00,
    description: 'Delivery in 5-7 business days',
    estimatedDeliveryDays: 7,
    carrier: 'Australia Post'
  }
];

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
    console.log('Calculating shipping options for:', { totalWeight, destination, items });
    
    // Always return the free shipping option regardless of order total or weight
    return standardShippingOptions;
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
  
  console.log('Getting shipping options for postal code:', postalCode);
  
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
