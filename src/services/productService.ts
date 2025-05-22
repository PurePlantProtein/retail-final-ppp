import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

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
