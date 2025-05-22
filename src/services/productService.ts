import { Database } from '@/types/product';
import { Product } from '@/types/product';
import { Category } from '@/types/product';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { mapProductForClient, mapProductForStorage } from '@/utils/productUtils';

const supabase = createClientComponentClient<Database>();

export const getProducts = async (): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return products.map(mapProductForClient);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }

  if (product) {
    return mapProductForClient(product);
  }
  return null;
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  const dbProduct = mapProductForStorage(productData);

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([dbProduct])
    .select('*')
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message);
  }

  return mapProductForClient(newProduct);
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const dbProduct = mapProductForStorage(productData);

  const { data: updatedProduct, error } = await supabase
    .from('products')
    .update(dbProduct)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapProductForClient(updatedProduct);
};

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

export const getCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .distinct();

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error(error.message);
    }

    // Extract categories from the data
    const categories = data.map(item => item.category);
    return categories;
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
};
