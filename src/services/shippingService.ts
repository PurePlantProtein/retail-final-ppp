import { ShippingOption, ShippingCarrier, Product } from '@/types/product';

// Mock data for Australia Post shipping options
const australiaPostOptions: ShippingOption[] = [
  {
    id: 'ap-standard',
    name: 'Standard Post',
    carrier: 'australia-post',
    price: 9.95,
    estimatedDeliveryDays: '3-7 business days',
    description: 'Standard delivery within Australia'
  },
  {
    id: 'ap-express',
    name: 'Express Post',
    carrier: 'australia-post',
    price: 14.95,
    estimatedDeliveryDays: '1-3 business days',
    description: 'Express delivery with tracking within Australia'
  },
  {
    id: 'ap-courier',
    name: 'Courier Post',
    carrier: 'australia-post',
    price: 19.95,
    estimatedDeliveryDays: 'Next business day',
    description: 'Priority courier delivery for metro areas'
  }
];

// Mock data for Transdirect shipping options
const transdirectOptions: ShippingOption[] = [
  {
    id: 'td-road',
    name: 'Road Freight',
    carrier: 'transdirect',
    price: 12.95,
    estimatedDeliveryDays: '3-5 business days',
    description: 'Standard road freight delivery'
  },
  {
    id: 'td-express',
    name: 'Express Freight',
    carrier: 'transdirect',
    price: 17.95,
    estimatedDeliveryDays: '1-2 business days',
    description: 'Express road delivery service'
  },
  {
    id: 'td-same-day',
    name: 'Same Day',
    carrier: 'transdirect',
    price: 29.95,
    estimatedDeliveryDays: 'Same business day',
    description: 'Same day delivery for metro areas (order before 10 AM)'
  }
];

// Get shipping settings from localStorage
const getShippingSettings = () => {
  const settingsJson = localStorage.getItem('shippingSettings');
  if (settingsJson) {
    return JSON.parse(settingsJson);
  }
  
  // Default settings
  return {
    freeShippingThreshold: 12, // Default: 12 protein products
    freeShippingMessage: 'Free shipping for orders with 12+ protein products',
    freeShippingDays: '5-7 business days',
  };
};

// Calculate shipping options based on cart weight, dimensions, destination, and products
export const calculateShippingOptions = (
  totalWeight: number,
  destination: { 
    postalCode: string; 
    state: string;
  },
  products?: { product: Product; quantity: number }[]
): Promise<ShippingOption[]> => {
  return new Promise((resolve) => {
    // Simulate API call to shipping providers
    setTimeout(() => {
      // Get shipping settings
      const settings = getShippingSettings();
      
      // Check if free shipping is applicable
      const qualifiesForFreeShipping = products && isEligibleForFreeShipping(products, settings.freeShippingThreshold);
      console.log('Free shipping eligible:', qualifiesForFreeShipping);
      
      // If free shipping is applicable, only return the free shipping option
      if (qualifiesForFreeShipping) {
        // Create free shipping option
        const freeShippingOption: ShippingOption = {
          id: 'free-shipping',
          name: 'Free Shipping',
          carrier: 'australia-post',
          price: 0,
          estimatedDeliveryDays: settings.freeShippingDays,
          description: settings.freeShippingMessage
        };
        
        // Only return free shipping when eligible
        resolve([freeShippingOption]);
        return;
      }
      
      // Otherwise return standard shipping options
      let availableOptions: ShippingOption[] = [...australiaPostOptions, ...transdirectOptions];
      
      // Apply simple business rules to adjust prices based on weight
      if (totalWeight > 5) {
        availableOptions = availableOptions.map(option => {
          return {
            ...option,
            price: option.price * 1.5 // 50% price increase for heavy packages
          };
        });
      }
      
      // Filter or adjust options based on postal code and state
      if (destination.postalCode.startsWith('3') && destination.state === 'VIC') {
        // Faster delivery for Melbourne metro
        availableOptions = availableOptions.filter(option => true);
      } else if (destination.state === 'TAS' || destination.state === 'NT') {
        // Remove same day options for remote states
        availableOptions = availableOptions.filter(option => option.id !== 'td-same-day');
        
        // Increase price for these destinations
        availableOptions = availableOptions.map(option => ({
          ...option,
          price: option.price * 1.2,
          estimatedDeliveryDays: option.id.includes('express') 
            ? '2-4 business days' 
            : '7-10 business days'
        }));
      }
      
      resolve(availableOptions);
    }, 500);
  });
};

// Helper function to check if order qualifies for free shipping
export const isEligibleForFreeShipping = (
  items: { product: Product; quantity: number }[],
  threshold: number
): boolean => {
  // Count protein products
  const proteinProductCount = items.reduce((total, item) => {
    // Check if product category is protein (case insensitive)
    if (item.product.category && 
        item.product.category.toLowerCase().includes('protein')) {
      return total + item.quantity;
    }
    return total;
  }, 0);
  
  // Debug log to help troubleshoot
  console.log('Protein product count:', proteinProductCount, 'Threshold:', threshold);
  
  // Free shipping for orders with threshold number of protein products
  return proteinProductCount >= threshold;
};

// Get shipping option by ID
export const getShippingOptionById = (
  id: string
): Promise<ShippingOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allOptions = [...australiaPostOptions, ...transdirectOptions];
      
      // Also check for free shipping option
      if (id === 'free-shipping') {
        const settings = getShippingSettings();
        resolve({
          id: 'free-shipping',
          name: 'Free Shipping',
          carrier: 'australia-post',
          price: 0,
          estimatedDeliveryDays: settings.freeShippingDays,
          description: settings.freeShippingMessage
        });
        return;
      }
      
      resolve(allOptions.find(option => option.id === id));
    }, 200);
  });
};

// Update shipping settings
export const updateShippingSettings = (settings: {
  freeShippingThreshold?: number;
  freeShippingMessage?: string;
  freeShippingDays?: string;
}) => {
  const currentSettings = getShippingSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem('shippingSettings', JSON.stringify(updatedSettings));
};

// In a real implementation, we would have functions to:
// 1. Create shipping labels with Australia Post or Transdirect
// 2. Track shipments
// 3. Calculate accurate shipping rates
// 4. Handle international shipping

// Example function for creating a shipment (mock)
export const createShipment = (
  orderId: string,
  shippingOptionId: string,
  destination: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
): Promise<{ trackingNumber: string; labelUrl: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would call the actual API in a real implementation
      resolve({
        trackingNumber: `TRACK-${orderId}-${Math.floor(Math.random() * 1000000)}`,
        labelUrl: `https://example.com/shipping-labels/${orderId}.pdf`
      });
    }, 800);
  });
};
