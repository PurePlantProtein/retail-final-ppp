
import { supabase } from '@/integrations/supabase/client';
import { MarketingMaterial } from '@/types/product';

// Function to get all marketing materials
export const getMarketingMaterials = async (): Promise<MarketingMaterial[]> => {
  try {
    // Use a hardcoded mock data for now since the marketing_materials table doesn't exist yet
    // Normally we would query the database like this:
    // const { data, error } = await supabase
    //   .from('marketing_materials')
    //   .select('*')
    //   .order('created_at', { ascending: false });
    
    // if (error) throw error;
    
    // Mock data as a temporary solution until we create the marketing_materials table
    const mockData: MarketingMaterial[] = [
      {
        id: "1",
        title: "Product Brochure",
        description: "A comprehensive guide to our products",
        file_url: "/placeholder.svg",
        file_type: "application/pdf",
        category: "Brochures",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "2",
        title: "Brand Logo Pack",
        description: "High-resolution logos for marketing use",
        file_url: "/placeholder.svg",
        file_type: "image/jpeg",
        category: "Logos",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return mockData;
  } catch (error) {
    console.error("Error fetching marketing materials:", error);
    throw error;
  }
};

// Function to get marketing materials by category
export const getMarketingMaterialsByCategory = async (category: string): Promise<MarketingMaterial[]> => {
  try {
    // Use mock data for now
    const allMaterials = await getMarketingMaterials();
    return allMaterials.filter(material => material.category === category);
  } catch (error) {
    console.error(`Error fetching marketing materials for category ${category}:`, error);
    throw error;
  }
};

// Function to upload a new marketing material
export const uploadMarketingMaterial = async (
  file: File,
  materialData: Omit<MarketingMaterial, 'id' | 'file_url' | 'created_at' | 'updated_at'>
): Promise<MarketingMaterial> => {
  try {
    // Mock implementation without actual storage
    const newMaterial: MarketingMaterial = {
      id: Date.now().toString(),
      title: materialData.title,
      description: materialData.description,
      file_url: URL.createObjectURL(file), // This is temporary and will only work during the current session
      file_type: file.type,
      category: materialData.category || 'General',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Uploaded marketing material (mock):", newMaterial);
    
    return newMaterial;
  } catch (error) {
    console.error("Error uploading marketing material:", error);
    throw error;
  }
};

// Function to delete a marketing material
export const deleteMarketingMaterial = async (id: string): Promise<void> => {
  // Mock implementation
  console.log(`Marketing material with ID ${id} would be deleted here`);
};
