
import { Order, Product } from '@/types/product';

/**
 * Creates a sample order for testing email templates
 */
export const createSampleOrder = (): Order => {
  const product: Product = {
    id: 'sample-product',
    name: 'Sample Protein Powder',
    description: 'This is a sample product for testing',
    price: 49.99,
    min_quantity: 12,
    stock: 100,
    category: 'protein',
    image: 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png',
    weight: 1,
    bag_size: '1kg',
    number_of_servings: 30,
    serving_size: '30g',
    ingredients: 'Pea protein, natural flavors',
    amino_acid_profile: null,
    nutritional_info: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    // Add camelCase aliases
    minQuantity: 12,
    bagSize: '1kg',
    numberOfServings: 30,
    servingSize: '30g',
    aminoAcidProfile: null,
    nutritionalInfo: null,
  };
  
  return {
    id: 'sample-order-123',
    userId: 'sample-user',
    userName: 'John Smith',
    email: 'john@example.com',
    items: [
      {
        product,
        quantity: 12
      }
    ],
    total: 599.88,
    status: 'pending',
    createdAt: new Date().toISOString(),
    paymentMethod: 'bank-transfer',
    invoiceStatus: 'draft',
    invoiceUrl: '2025-0001', // Store invoice number in invoiceUrl for compatibility
    shippingAddress: {
      name: 'John Smith',
      street: '123 Main St',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'Australia',
      phone: '0412345678'
    },
    notes: 'Please leave at the front door',
    updatedAt: new Date().toISOString()
  };
};
