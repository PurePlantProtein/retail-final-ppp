import { supabase } from '@/integrations/supabase/client';
import { Product, Category, AminoAcid, NutritionalValue } from '@/types/product';

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
    // New fields
    servingSize: item.serving_size,
    numberOfServings: item.number_of_servings,
    bagSize: item.bag_size,
    ingredients: item.ingredients,
    aminoAcidProfile: item.amino_acid_profile,
    nutritionalInfo: item.nutritional_info,
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

// Fetch products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }

  return data.map(transformProduct);
};

// Count products by category
export const countProductsByCategory = async (category: string): Promise<number> => {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', category);

  if (error) {
    console.error(`Error counting products in category ${category}:`, error);
    throw error;
  }

  return count || 0;
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
      serving_size: product.servingSize,
      number_of_servings: product.numberOfServings,
      bag_size: product.bagSize,
      ingredients: product.ingredients,
      amino_acid_profile: product.aminoAcidProfile,
      nutritional_info: product.nutritionalInfo,
    }))
  );

  if (error) {
    console.error('Error importing products:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  // Convert the product data to match database column names
  const productData = {
    name: product.name,
    description: product.description,
    price: product.price,
    min_quantity: product.minQuantity,
    stock: product.stock,
    image: product.image,
    category: product.category,
    // New fields
    serving_size: product.servingSize,
    number_of_servings: product.numberOfServings,
    bag_size: product.bagSize,
    ingredients: product.ingredients,
    amino_acid_profile: product.aminoAcidProfile,
    nutritional_info: product.nutritionalInfo,
  };
  
  console.log('Creating product with data:', productData);
  
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
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
  
  // New fields
  if (product.servingSize !== undefined) updateData.serving_size = product.servingSize;
  if (product.numberOfServings !== undefined) updateData.number_of_servings = product.numberOfServings;
  if (product.bagSize !== undefined) updateData.bag_size = product.bagSize;
  if (product.ingredients !== undefined) updateData.ingredients = product.ingredients;
  if (product.aminoAcidProfile !== undefined) updateData.amino_acid_profile = product.aminoAcidProfile;
  if (product.nutritionalInfo !== undefined) updateData.nutritional_info = product.nutritionalInfo;
  
  console.log(`Updating product ${id} with data:`, updateData);
  
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
  console.log('Fetching categories...');
  
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
  
  console.log('Fetched categories:', categories);
  
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

// Delete a category by removing all products in that category
export const deleteCategory = async (categoryName: string): Promise<void> => {
  // Get all products in the category first
  const { data, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('category', categoryName);

  if (fetchError) {
    console.error(`Error fetching products in category ${categoryName}:`, fetchError);
    throw fetchError;
  }

  // If there are products with this category, delete them
  if (data && data.length > 0) {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('category', categoryName);

    if (deleteError) {
      console.error(`Error deleting products in category ${categoryName}:`, deleteError);
      throw deleteError;
    }
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
    category: "protein"
  },
  {
    name: "PP Protein Chocolate Whey Protein 1kg",
    description: "Rich chocolate flavored whey protein powder, 1kg bag. Perfect post-workout supplement.",
    price: 25.99,
    minQuantity: 10,
    stock: 100,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-light-chocolate_360x.png",
    category: "protein"
  },
  {
    name: "PP Protein Strawberry Whey Protein 1kg",
    description: "Delicious strawberry flavored whey protein powder, 1kg bag. Packed with essential amino acids.",
    price: 25.99,
    minQuantity: 10,
    stock: 100,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-light-strawberry_360x.png",
    category: "protein"
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
    category: "supplements"
  },
  {
    name: "PP Protein Mass Gainer 2kg",
    description: "High-calorie mass gainer formula for bulking and weight gain, 2kg bag.",
    price: 39.99,
    minQuantity: 5,
    stock: 40,
    image: "https://ppprotein.com.au/cdn/shop/files/ppprotein-isolate_360x.png",
    category: "supplements"
  }
];
