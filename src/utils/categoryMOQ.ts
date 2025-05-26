
// Utility functions for handling category minimum order quantities

export const getCategoryMOQ = (category: string): number | undefined => {
  // Define the MOQ values for different categories
  const categoryMOQs: Record<string, number> = {
    'Protein Powder': 12,
    'protein powder': 12, // Handle case variations
    // Add more categories with their MOQ as needed
  };

  return categoryMOQs[category] || categoryMOQs[category?.toLowerCase()];
};

export const getCategoryTotalQuantity = (items: any[], category: string): number => {
  return items
    .filter(item => 
      item.product.category?.toLowerCase() === category?.toLowerCase() ||
      item.product.category === category
    )
    .reduce((total, item) => total + item.quantity, 0);
};
