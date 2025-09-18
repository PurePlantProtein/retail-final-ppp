import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { mapProductForClient, mapProductForStorage } from '@/utils/productUtils';

const apiBase = '/api';
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to get all products (REST)
export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${apiBase}/products`, { headers: { ...authHeaders() } });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to fetch products');
  return (body.data || []).map((item: any) => mapProductForClient(item));
};

// Function to get products by category (REST)
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const res = await fetch(`${apiBase}/products?category=${encodeURIComponent(categoryId)}`, { headers: { ...authHeaders() } });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || `Failed to fetch products for category ${categoryId}`);
  return (body.data || []).map((item: any) => mapProductForClient(item));
};

// Function to get a product by ID (REST)
export const getProductById = async (id: string): Promise<Product | null> => {
  const res = await fetch(`${apiBase}/products/${id}`, { headers: { ...authHeaders() } });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || `Failed to fetch product ${id}`);
  return body.data ? mapProductForClient(body.data) : null;
};

// Function to add a new product
export const addProduct = async (productData: any): Promise<Product> => {
  const token = localStorage.getItem('token');
  const payload = mapProductForStorage(productData);
  const resp = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
  let rawText = '';
  let body: any = {};
  try { rawText = await resp.text(); body = rawText ? JSON.parse(rawText) : {}; } catch { body = {}; }
  if (resp.status === 422) {
    const details = (body && (body.details || {}));
    const first = Object.values(details)[0];
    const message = (typeof first === 'string' ? first : undefined) || 'Validation failed';
    throw new Error(message);
  }
  if (resp.status === 401) {
    throw new Error('Unauthorized (session expired). Please log in again.');
  }
  if (!resp.ok) {
    console.error('[addProduct] create failed', { status: resp.status, body, rawText });
    throw new Error(body?.error || body?.message || `Product create failed (status ${resp.status})`);
  }
  const row = body.data;
  return mapProductForClient({ ...row, product_categories: row.category ? { id: row.category, name: '' } : null });
};

// Function to update an existing product
export const updateProduct = async (id: string, productData: any): Promise<Product | null> => {
  const token = localStorage.getItem('token');
  const transformedData = mapProductForStorage(productData);
  const resp = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(transformedData)
  });
  let rawText = ''; let body: any = {};
  try { rawText = await resp.text(); body = rawText ? JSON.parse(rawText) : {}; } catch { body = {}; }
  if (resp.status === 422) {
    const details = body?.details || {};
    const first = Object.values(details)[0];
    const message = (typeof first === 'string' ? first : undefined) || 'Validation failed';
    throw new Error(message);
  }
  if (resp.status === 401) {
    throw new Error('Unauthorized (session expired). Please log in again.');
  }
  if (!resp.ok) {
    console.error('[updateProduct] failed', { status: resp.status, body, rawText });
    throw new Error(body?.error || body?.message || `Product update failed (status ${resp.status})`);
  }
  const row = body.data;
  return row ? mapProductForClient({ ...row, product_categories: row.category ? { id: row.category, name: row.product_categories?.name || '' } : null }) : null;
};

// Function to delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  const resp = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (resp.status === 401) {
    throw new Error('Unauthorized (session expired). Please log in again.');
  }
  if (!resp.ok) {
    // Fallback to generic query delete
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw new Error(error.message);
    }
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
  return (data || []).map((c: any) => ({ id: String(c.id), name: c.name }));
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

// Function to delete a category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error: updateError } = await supabase
    .from('products')
    .update({ category: null })
    .eq('category', categoryId);
  if (updateError) {
    console.error(`Error clearing category from products:`, updateError);
    throw new Error(updateError.message);
  }
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', categoryId);
  if (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw new Error(error.message);
  }
};

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
    console.error('Error importing products:', error);
    throw error;
  }
};
