import { Category } from '@/types/product';

// Utility functions for handling category minimum order quantities

export const getCategoryMOQ = (category: string | Category): number | undefined => {
  // Accept category as string or Category object
  const categoryName = typeof category === 'string' ? category : category.name;
  // Define the MOQ values for different categories
  const categoryMOQs: Record<string, number> = {
    'Protein Powder': 12,
    'protein powder': 12, // Handle case variations
    // Add more categories with their MOQ as needed
  };

  return categoryMOQs[categoryName] || categoryMOQs[categoryName?.toLowerCase()];
};

export const getCategoryTotalQuantity = (items: any[], category: string | Category): number => {
  const categoryId = typeof category === 'string' ? category : category.id;
  return items
    .filter(item => item.product.category?.id === categoryId)
    .reduce((total, item) => total + item.quantity, 0);
};
