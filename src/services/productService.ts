import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { mapProductForClient, mapProductForStorage } from '@/utils/productUtils';

// Function to get all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.message);
  }

  return (data || []).map((item) => mapProductForClient(item));
};

// Function to get products by category
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(id, name)')
    .eq('category', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw new Error(error.message);
  }

  return (data || []).map((item) => mapProductForClient(item));
};

// Function to get a product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(id, name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return data ? mapProductForClient(data) : null;
};

// Function to add a new product
export const addProduct = async (productData: any): Promise<Product> => {
  // Transform data for storage
  const transformedData = mapProductForStorage(productData);

  const { data, error } = await supabase
    .from('products')
    .insert([transformedData])
    .select('*, product_categories(id, name)')
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw new Error(error.message);
  }

  return mapProductForClient(data);
};

// Function to update an existing product
export const updateProduct = async (id: string, productData: any): Promise<Product | null> => {
  // Transform data for storage
  const transformedData = mapProductForStorage(productData);

  const { data, error } = await supabase
    .from('products')
    .update(transformedData)
    .eq('id', id)
    .select('*, product_categories(id, name)')
    .single();

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return data ? mapProductForClient(data) : null;
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

// Function to get all unique categories (now from product_categories table)
export const getCategories = async (): Promise<{ id: string; name: string }[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to add a new category
export const addCategory = async (categoryName: string): Promise<{ id: string; name: string }> => {
  const { data, error } = await supabase
    .from('product_categories')
    .insert([{ name: categoryName }])
    .select('id, name')
    .single();

  if (error) {
    console.error(`Error adding category ${categoryName}:`, error);
    throw new Error(error.message);
  }

  return data;
};

// Function to delete a category (removes the category row and sets category to null for affected products)
export const deleteCategory = async (categoryId: string): Promise<void> => {
  // Set category to null for all products using this category
  const { error: updateError } = await supabase
    .from('products')
    .update({ category: null })
    .eq('category', categoryId);
  if (updateError) {
    console.error(`Error clearing category from products:`, updateError);
    throw new Error(updateError.message);
  }
  // Delete the category
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', categoryId);
  if (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw new Error(error.message);
  }
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
      await createProduct(product);
    }
  } catch (error) {
    console.error("Error importing products:", error);
    throw error;
  }
};
