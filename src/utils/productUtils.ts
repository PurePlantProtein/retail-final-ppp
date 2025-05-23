
import { Product, AminoAcid, NutritionalValue } from '@/types/product';
import { Json } from '@/integrations/supabase/types';

/**
 * Maps snake_case database fields to camelCase properties for frontend use
 * and ensures proper type casting for JSON fields
 */
export const mapProductForClient = (product: any): Product => {
  if (!product) return {} as Product;
  
  // Handle conversion of JSON types
  let aminoAcidProfile: AminoAcid[] | null = null;
  if (product.amino_acid_profile) {
    if (Array.isArray(product.amino_acid_profile)) {
      aminoAcidProfile = product.amino_acid_profile;
    } else if (typeof product.amino_acid_profile === 'object') {
      // Convert object format to array format if needed
      aminoAcidProfile = Object.entries(product.amino_acid_profile).map(([name, amount]) => ({
        name,
        amount: typeof amount === 'number' ? `${amount}g` : amount as string
      }));
    }
  }
  
  let nutritionalInfo: NutritionalValue[] | null = null;
  if (product.nutritional_info) {
    if (Array.isArray(product.nutritional_info)) {
      nutritionalInfo = product.nutritional_info;
    } else if (typeof product.nutritional_info === 'object') {
      // Convert object format to array format if needed
      nutritionalInfo = Object.entries(product.nutritional_info).map(([name, value]) => ({
        name,
        perServing: typeof value === 'number' ? `${value}g` : value as string,
        per100g: typeof value === 'number' ? `${value * 100 / 30}g` : value as string 
      }));
    }
  }
  
  return {
    ...product,
    minQuantity: product.min_quantity,
    bagSize: product.bag_size,
    numberOfServings: product.number_of_servings,
    servingSize: product.serving_size,
    aminoAcidProfile: aminoAcidProfile,
    nutritionalInfo: nutritionalInfo,
  };
};

/**
 * Maps camelCase properties to snake_case for database storage
 */
export const mapProductForStorage = (product: Partial<Product>): any => {
  const { 
    minQuantity, 
    bagSize, 
    numberOfServings, 
    servingSize, 
    aminoAcidProfile, 
    nutritionalInfo, 
    ...rest 
  } = product;

  return {
    ...rest,
    min_quantity: minQuantity !== undefined ? minQuantity : product.min_quantity,
    bag_size: bagSize !== undefined ? bagSize : product.bag_size,
    number_of_servings: numberOfServings !== undefined ? numberOfServings : product.number_of_servings,
    serving_size: servingSize !== undefined ? servingSize : product.serving_size,
    amino_acid_profile: aminoAcidProfile !== undefined ? aminoAcidProfile as unknown as Json : product.amino_acid_profile,
    nutritional_info: nutritionalInfo !== undefined ? nutritionalInfo as unknown as Json : product.nutritional_info,
  };
};
