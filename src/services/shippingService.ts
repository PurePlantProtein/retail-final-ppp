
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
      // In a real implementation, we would call Australia Post and Transdirect APIs here
      // and calculate actual shipping rates based on weight, dimensions, and destination
      
      // For now, return mock data
      let availableOptions: ShippingOption[] = [...australiaPostOptions, ...transdirectOptions];
      
      // Check if free shipping is applicable (12+ protein products)
      const qualifiesForFreeShipping = products && isEligibleForFreeShipping(products);
      
      if (qualifiesForFreeShipping) {
        // Add free shipping option at the beginning of the array to make it the default option
        const freeShippingOption: ShippingOption = {
          id: 'free-shipping',
          name: 'Free Shipping',
          carrier: 'australia-post',
          price: 0,
          estimatedDeliveryDays: '5-7 business days',
          description: 'Free shipping for orders with 12+ protein products'
        };
        
        availableOptions = [freeShippingOption, ...availableOptions];
      }
      
      // Apply simple business rules to adjust prices based on weight
      if (totalWeight > 5) {
        availableOptions = availableOptions.map(option => {
          // Don't increase price of free shipping
          if (option.id === 'free-shipping') return option;
          
          return {
            ...option,
            price: option.price * 1.5 // 50% price increase for heavy packages
          };
        });
      }
      
      // Filter or adjust options based on postal code and state
      // For example, same day delivery might only be available in certain postal codes
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
  items: { product: Product; quantity: number }[]
): boolean => {
  // Count protein products
  const proteinProductCount = items.reduce((total, item) => {
    // Check if product category is protein (case insensitive)
    if (item.product.category && 
        item.product.category.toLowerCase() === 'protein') {
      return total + item.quantity;
    }
    return total;
  }, 0);
  
  // Debug log to help troubleshoot
  console.log('Protein product count:', proteinProductCount);
  
  // Free shipping for orders with 12+ protein products
  return proteinProductCount >= 12;
};

// Get shipping option by ID
export const getShippingOptionById = (
  id: string
): Promise<ShippingOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allOptions = [...australiaPostOptions, ...transdirectOptions];
      resolve(allOptions.find(option => option.id === id));
    }, 200);
  });
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
