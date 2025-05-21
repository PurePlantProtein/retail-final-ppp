
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

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
    category: item.category || 'other',
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

// Example import data for PP Protein products
export const ppProteinSampleProducts = [
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
