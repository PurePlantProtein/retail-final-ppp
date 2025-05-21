
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/product';

// Transform Supabase product data to our Product type
const transformProduct = (item: any): Product => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
    minQuantity: item.min_quantity,
    stock: item.stock,
    image: item.image || 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png',
    category: (item.category as Category) || 'other',
  };
};

// Fetch all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data.map(transformProduct);
};

// Fetch a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // If the error is a "not found" error, return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching product:', error);
    throw error;
  }

  return transformProduct(data);
};

// Import products (admin only)
export const importProducts = async (products: Omit<Product, 'id'>[]): Promise<void> => {
  const { error } = await supabase.from('products').insert(
    products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      min_quantity: product.minQuantity,
      stock: product.stock,
      image: product.image,
      category: product.category,
    }))
  );

  if (error) {
    console.error('Error importing products:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  // Log the authenticated state before making the request
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Current auth session:', sessionData?.session ? 'Authenticated' : 'Not authenticated');

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description,
      price: product.price,
      min_quantity: product.minQuantity,
      stock: product.stock,
      image: product.image,
      category: product.category,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return transformProduct(data);
};

// Update an existing product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> => {
  const updateData: any = {};
  
  if (product.name !== undefined) updateData.name = product.name;
  if (product.description !== undefined) updateData.description = product.description;
  if (product.price !== undefined) updateData.price = product.price;
  if (product.minQuantity !== undefined) updateData.min_quantity = product.minQuantity;
  if (product.stock !== undefined) updateData.stock = product.stock;
  if (product.image !== undefined) updateData.image = product.image;
  if (product.category !== undefined) updateData.category = product.category;
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return transformProduct(data);
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

// Get all available categories
export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('category');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  // Filter unique categories and remove null values
  const categories = data
    .map(item => item.category)
    .filter((category, index, self) => 
      category !== null && 
      category !== undefined && 
      self.indexOf(category) === index
    );

  return categories;
};

// Create a new category (by adding a product with that category)
export const addCategory = async (categoryName: string): Promise<void> => {
  // This is a simple implementation - in a real-world scenario,
  // you might want a separate categories table
  const dummyProduct = {
    name: `${categoryName} Category Placeholder`,
    description: `Placeholder for ${categoryName} category`,
    price: 0,
    minQuantity: 1,
    stock: 0,
    image: 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png',
    category: categoryName.toLowerCase(),
  };

  const { error } = await supabase
    .from('products')
    .insert({
      name: dummyProduct.name,
      description: dummyProduct.description,
      price: dummyProduct.price,
      min_quantity: dummyProduct.minQuantity,
      stock: dummyProduct.stock,
      image: dummyProduct.image,
      category: dummyProduct.category,
    });

  if (error) {
    console.error('Error creating category:', error);
    throw new Error(`Failed to create category: ${error.message}`);
  }
};

// Example import data for PP Protein products
export const ppProteinSampleProducts: Omit<Product, 'id'>[] = [
  {
    name: "PP Protein Vanilla Whey Protein 1kg",
    description: "Premium vanilla flavored whey protein powder, 1kg bag. Ideal for muscle recovery and growth.",
    price: 25.99,
    minQuantity: 10,
    stock: 100,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-light-vanilla_360x.png",
    category: "food"
  },
  {
    name: "PP Protein Chocolate Whey Protein 1kg",
    description: "Rich chocolate flavored whey protein powder, 1kg bag. Perfect post-workout supplement.",
    price: 25.99,
    minQuantity: 10,
    stock: 100,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-light-chocolate_360x.png",
    category: "food"
  },
  {
    name: "PP Protein Strawberry Whey Protein 1kg",
    description: "Delicious strawberry flavored whey protein powder, 1kg bag. Packed with essential amino acids.",
    price: 25.99,
    minQuantity: 10,
    stock: 100,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-light-strawberry_360x.png",
    category: "food"
  },
  {
    name: "PP Protein Shaker Bottle",
    description: "High-quality PP Protein branded shaker bottle, 600ml capacity. BPA free with mixing ball included.",
    price: 9.99,
    minQuantity: 25,
    stock: 200,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_360x.png",
    category: "accessories"
  },
  {
    name: "PP Protein Pre-Workout Energy Blend",
    description: "Advanced pre-workout formula with caffeine and B-vitamins for increased energy and focus during workouts.",
    price: 29.99,
    minQuantity: 5,
    stock: 50,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-preworkout_360x.png",
    category: "food"
  },
  {
    name: "PP Protein Mass Gainer 2kg",
    description: "High-calorie mass gainer formula for bulking and weight gain, 2kg bag.",
    price: 39.99,
    minQuantity: 5,
    stock: 40,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-isolate_360x.png",
    category: "food"
  }
];
