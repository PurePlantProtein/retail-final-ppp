
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { mapProductForClient, mapProductForStorage } from '@/utils/productUtils';

// Function to get all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get a product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return data || null;
};

// Function to add a new product
export const addProduct = async (productData: any): Promise<Product> => {
  // Transform camelCase to snake_case for DB compatibility
  const transformedData = {
    ...productData,
    min_quantity: productData.minQuantity || productData.min_quantity,
    bag_size: productData.bagSize || productData.bag_size,
    number_of_servings: productData.numberOfServings || productData.number_of_servings,
    serving_size: productData.servingSize || productData.serving_size,
    amino_acid_profile: productData.aminoAcidProfile || productData.amino_acid_profile,
    nutritional_info: productData.nutritionalInfo || productData.nutritional_info
  };

  const { data, error } = await supabase
    .from('products')
    .insert([transformedData])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw new Error(error.message);
  }

  return data;
};

// Function to update an existing product
export const updateProduct = async (id: string, productData: any): Promise<Product | null> => {
  // Transform camelCase to snake_case for DB compatibility
  const transformedData = {
    ...productData,
    min_quantity: productData.minQuantity || productData.min_quantity,
    bag_size: productData.bagSize || productData.bag_size,
    number_of_servings: productData.numberOfServings || productData.number_of_servings,
    serving_size: productData.servingSize || productData.serving_size,
    amino_acid_profile: productData.aminoAcidProfile || productData.amino_acid_profile,
    nutritional_info: productData.nutritionalInfo || productData.nutritional_info
  };
  
  const { data, error } = await supabase
    .from('products')
    .update(transformedData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return data || null;
};

// Function to delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

// Function aliases for better naming
export const createProduct = addProduct;

// Function to get all unique categories
export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .order('category');

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(error.message);
  }

  const categories = data
    .map(item => item.category)
    .filter(Boolean) // Remove null/undefined values
    .filter((value, index, self) => self.indexOf(value) === index); // Unique values only

  return categories;
};

// Function to add a new category (creates a placeholder product in that category)
export const addCategory = async (categoryName: string): Promise<string> => {
  const placeholderProduct = {
    name: `${categoryName} Category`,
    description: `Placeholder for ${categoryName} category`,
    price: 0,
    min_quantity: 1,
    stock: 0,
    category: categoryName,
    image: null
  };

  await addProduct(placeholderProduct);
  return categoryName;
};

// Function to delete a category (removes the category from all products)
export const deleteCategory = async (categoryName: string): Promise<void> => {
  // We don't actually delete categories - we just remove the category from products
  // This is just a placeholder implementation
  console.log(`Category ${categoryName} would be deleted here`);
};

// Sample products for import functionality
export const ppProteinSampleProducts = [
  {
    name: "Pure Plant Protein - Vanilla",
    description: "Premium plant-based vanilla protein powder",
    price: 49.99,
    minQuantity: 1,
    stock: 100,
    category: "Proteins",
    image: "/placeholder.svg",
    weight: 1.0,
    bagSize: "1kg",
    numberOfServings: 20,
    servingSize: "50g",
    ingredients: "Pea protein, rice protein, natural flavors, stevia",
    aminoAcidProfile: [
      { name: "Leucine", amount: "2.5g" },
      { name: "Isoleucine", amount: "1.2g" },
      { name: "Valine", amount: "1.5g" }
    ],
    nutritionalInfo: [
      { name: "Protein", perServing: "21g", per100g: "42g" },
      { name: "Fat", perServing: "2g", per100g: "4g" },
      { name: "Carbohydrates", perServing: "3g", per100g: "6g" }
    ]
  },
  {
    name: "Pure Plant Protein - Chocolate",
    description: "Premium plant-based chocolate protein powder",
    price: 49.99,
    minQuantity: 1,
    stock: 100,
    category: "Proteins",
    image: "/placeholder.svg",
    weight: 1.0,
    bagSize: "1kg",
    numberOfServings: 20,
    servingSize: "50g",
    ingredients: "Pea protein, rice protein, cacao, natural flavors, stevia",
    aminoAcidProfile: [
      { name: "Leucine", amount: "2.5g" },
      { name: "Isoleucine", amount: "1.2g" },
      { name: "Valine", amount: "1.5g" }
    ],
    nutritionalInfo: [
      { name: "Protein", perServing: "21g", per100g: "42g" },
      { name: "Fat", perServing: "2g", per100g: "4g" },
      { name: "Carbohydrates", perServing: "3g", per100g: "6g" }
    ]
  }
];

// Function to import sample products
export const importProducts = async (products: any[]): Promise<void> => {
  try {
    for (const product of products) {
      await createProduct(mapProductForStorage(product));
    }
  } catch (error) {
    console.error("Error importing products:", error);
    throw error;
  }
};
