
import { Product, AminoAcid, NutritionalValue } from '@/types/product';

/**
 * Maps snake_case database fields to camelCase properties for frontend use
 */
export const mapProductForClient = (product: Product): Product => {
  return {
    ...product,
    minQuantity: product.min_quantity,
    bagSize: product.bag_size,
    numberOfServings: product.number_of_servings,
    servingSize: product.serving_size,
    aminoAcidProfile: product.amino_acid_profile as AminoAcid[] | null,
    nutritionalInfo: product.nutritional_info as NutritionalValue[] | null,
  };
};

/**
 * Maps camelCase properties to snake_case for database storage
 */
export const mapProductForStorage = (product: Partial<Product>): Partial<Product> => {
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
    amino_acid_profile: aminoAcidProfile !== undefined ? aminoAcidProfile as any : product.amino_acid_profile,
    nutritional_info: nutritionalInfo !== undefined ? nutritionalInfo as any : product.nutritional_info,
  };
};
