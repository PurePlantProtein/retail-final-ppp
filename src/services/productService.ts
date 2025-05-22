import { Database } from '@/types/product';
import { Product } from '@/types/product';
import { Category } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { mapProductForClient, mapProductForStorage } from '@/utils/productUtils';

// Sample products for PP Protein
export const ppProteinSampleProducts: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'PP Protein Powder - Chocolate',
    description: 'Premium chocolate flavored protein powder with 25g of protein per serving.',
    price: 49.99,
    min_quantity: 1,
    minQuantity: 1,
    stock: 100,
    image: 'https://placehold.co/400x400/333/FFF?text=Chocolate+Protein',
    category: 'Protein Powder',
    weight: 1000,
    bag_size: '1kg',
    bagSize: '1kg',
    number_of_servings: 40,
    numberOfServings: 40,
    serving_size: '25g',
    servingSize: '25g',
    ingredients: 'Whey Protein Isolate, Cocoa Powder, Natural Flavors, Stevia',
    amino_acid_profile: [
      { name: 'Leucine', amount: '2.5g' },
      { name: 'Isoleucine', amount: '1.5g' },
      { name: 'Valine', amount: '1.5g' }
    ],
    aminoAcidProfile: [
      { name: 'Leucine', amount: '2.5g' },
      { name: 'Isoleucine', amount: '1.5g' },
      { name: 'Valine', amount: '1.5g' }
    ],
    nutritional_info: [
      { name: 'Protein', perServing: '25g', per100g: '80g' },
      { name: 'Carbohydrates', perServing: '3g', per100g: '10g' },
      { name: 'Fat', perServing: '1.5g', per100g: '5g' }
    ],
    nutritionalInfo: [
      { name: 'Protein', perServing: '25g', per100g: '80g' },
      { name: 'Carbohydrates', perServing: '3g', per100g: '10g' },
      { name: 'Fat', perServing: '1.5g', per100g: '5g' }
    ]
  },
  {
    name: 'PP Protein Powder - Vanilla',
    description: 'Premium vanilla flavored protein powder with 25g of protein per serving.',
    price: 49.99,
    min_quantity: 1,
    minQuantity: 1,
    stock: 100,
    image: 'https://placehold.co/400x400/333/FFF?text=Vanilla+Protein',
    category: 'Protein Powder',
    weight: 1000,
    bag_size: '1kg',
    bagSize: '1kg',
    number_of_servings: 40,
    numberOfServings: 40,
    serving_size: '25g',
    servingSize: '25g',
    ingredients: 'Whey Protein Isolate, Natural Vanilla Flavor, Stevia',
    amino_acid_profile: [
      { name: 'Leucine', amount: '2.5g' },
      { name: 'Isoleucine', amount: '1.5g' },
      { name: 'Valine', amount: '1.5g' }
    ],
    aminoAcidProfile: [
      { name: 'Leucine', amount: '2.5g' },
      { name: 'Isoleucine', amount: '1.5g' },
      { name: 'Valine', amount: '1.5g' }
    ],
    nutritional_info: [
      { name: 'Protein', perServing: '25g', per100g: '80g' },
      { name: 'Carbohydrates', perServing: '3g', per100g: '10g' },
      { name: 'Fat', perServing: '1.5g', per100g: '5g' }
    ],
    nutritionalInfo: [
      { name: 'Protein', perServing: '25g', per100g: '80g' },
      { name: 'Carbohydrates', perServing: '3g', per100g: '10g' },
      { name: 'Fat', perServing: '1.5g', per100g: '5g' }
    ]
  },
  {
    name: 'PP Protein Shaker',
    description: 'High-quality protein shaker with mixing ball for smooth shakes.',
    price: 12.99,
    min_quantity: 1,
    minQuantity: 1,
    stock: 200,
    image: 'https://placehold.co/400x400/333/FFF?text=Protein+Shaker',
    category: 'Accessories',
    weight: 180,
    bag_size: null,
    bagSize: null,
    number_of_servings: null,
    numberOfServings: null,
    serving_size: null,
    servingSize: null,
    ingredients: null,
    amino_acid_profile: null,
    aminoAcidProfile: null,
    nutritional_info: null,
    nutritionalInfo: null
  }
];

// Function to import sample products
export const importProducts = async (products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) => {
  const productsForDb = products.map(product => {
    // Ensure we're using the snake_case versions for the database
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      min_quantity: product.min_quantity,
      stock: product.stock,
      image: product.image,
      category: product.category,
      weight: product.weight,
      bag_size: product.bag_size,
      number_of_servings: product.number_of_servings,
      serving_size: product.serving_size,
      ingredients: product.ingredients,
      amino_acid_profile: product.amino_acid_profile,
      nutritional_info: product.nutritional_info
    };
  });

  const { data, error } = await supabase
    .from('products')
    .insert(productsForDb)
    .select('*');

  if (error) {
    console.error("Error importing products:", error);
    throw new Error(error.message);
  }

  return data.map(mapProductForClient);
};

export const getProducts = async (): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return products.map(product => mapProductForClient(product as any));
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

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
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

  return mapProductForClient(newProduct as any);
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

// Adding these new functions to manage categories
export const addCategory = async (categoryName: string): Promise<void> => {
  // Since we don't have a categories table, this would involve
  // creating a product with this category to ensure it exists
  // In a real application, you'd have a separate categories table
  const placeholder = {
    name: `${categoryName} Placeholder`,
    description: `Placeholder product for the ${categoryName} category`,
    price: 0,
    min_quantity: 1,
    minQuantity: 1,
    stock: 0,
    image: null,
    category: categoryName,
    weight: null,
    bag_size: null,
    bagSize: null,
    number_of_servings: null, 
    numberOfServings: null,
    serving_size: null,
    servingSize: null,
    ingredients: null,
    amino_acid_profile: null,
    aminoAcidProfile: null,
    nutritional_info: null,
    nutritionalInfo: null
  };

  await createProduct(placeholder);
};

export const deleteCategory = async (categoryName: string): Promise<void> => {
  // This would update all products in this category to a default category
  // In a real application with a categories table, you'd delete the category
  const { error } = await supabase
    .from('products')
    .update({ category: 'Uncategorized' })
    .eq('category', categoryName);

  if (error) {
    console.error(`Error deleting category ${categoryName}:`, error);
    throw new Error(error.message);
  }
};
