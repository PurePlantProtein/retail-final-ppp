import { Product, AminoAcid, NutritionalValue, Category } from '@/types/product';
import { Json } from '@/integrations/supabase/types';

/**
 * Maps snake_case database fields to camelCase properties for frontend use
 * and ensures proper type casting for JSON fields
 * Handles category as an object (id, name)
 */
export const mapProductForClient = (product: any): Product => {
  if (!product) return {} as Product;
  
  // Ensure numeric fields are proper numbers (pg numeric may come back as strings)
  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : (product.price ?? 0);
  const stockNum = typeof product.stock === 'string' ? parseInt(product.stock, 10) : (product.stock ?? 0);
  const weightNum = typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight;

  // Handle conversion of JSON types
  let aminoAcidProfile: AminoAcid[] | null = null;
  if (product.amino_acid_profile) {
    if (Array.isArray(product.amino_acid_profile)) {
      aminoAcidProfile = product.amino_acid_profile;
    } else if (typeof product.amino_acid_profile === 'object') {
      aminoAcidProfile = Object.entries(product.amino_acid_profile).map(([name, amount]) => ({
        name,
        amount: typeof amount === 'number' ? `${amount}g` : (amount as string),
      }));
    }
  }
  
  let nutritionalInfo: NutritionalValue[] | null = null;
  if (product.nutritional_info) {
    if (Array.isArray(product.nutritional_info)) {
      nutritionalInfo = product.nutritional_info;
    } else if (typeof product.nutritional_info === 'object') {
      nutritionalInfo = Object.entries(product.nutritional_info).map(([name, value]) => ({
        name,
        perServing: typeof value === 'number' ? `${value}g` : (value as string),
        per100g: typeof value === 'number' ? `${(value * 100) / 30}g` : (value as string),
      }));
    }
  }

  // Handle category as object (joined from product_categories)
  let category: Category | null = null;
  if (product.product_categories) {
    category = {
      id: product.product_categories.id,
      name: product.product_categories.name,
    };
  } else if (product.category) {
    // fallback: just id
    category = { id: product.category, name: '' };
  }

  return {
    ...product,
  price: Number.isFinite(priceNum) ? priceNum : 0,
  stock: Number.isFinite(stockNum) ? stockNum : 0,
  weight: typeof weightNum === 'number' && Number.isFinite(weightNum) ? weightNum : null,
    minQuantity: product.min_quantity,
    bagSize: product.bag_size,
    numberOfServings: product.number_of_servings,
    servingSize: product.serving_size,
  aminoAcidProfile: aminoAcidProfile || [],
  nutritionalInfo: nutritionalInfo || [],
    category: category,
  };
};

/**
 * Maps camelCase properties to snake_case for database storage
 * Handles category as uuid (id)
 */
export const mapProductForStorage = (product: Partial<Product>): any => {
  const {
    minQuantity,
    bagSize,
    numberOfServings,
    servingSize,
    aminoAcidProfile,
    nutritionalInfo,
    category,
    ...rest
  } = product;

  return {
    ...rest,
  // Ensure price is numeric when sending to DB
  price: typeof (rest as any).price === 'string' ? Number((rest as any).price) : (rest as any).price,
    min_quantity: minQuantity !== undefined ? minQuantity : product.minQuantity,
    bag_size: bagSize !== undefined ? bagSize : product.bagSize,
    number_of_servings: numberOfServings !== undefined ? numberOfServings : product.numberOfServings,
    serving_size: servingSize !== undefined ? servingSize : product.servingSize,
    amino_acid_profile: aminoAcidProfile !== undefined ? (aminoAcidProfile as unknown as Json) : product.aminoAcidProfile,
    nutritional_info: nutritionalInfo !== undefined ? (nutritionalInfo as unknown as Json) : product.nutritionalInfo,
  // Coerce category to string for frontend form compatibility but DB expects integer; let server convert to integer.
  category: category && typeof category === 'object' ? String(category.id) : (category != null ? String(category as any) : category),
  };
};
