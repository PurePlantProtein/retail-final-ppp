
import { supabase } from '@/integrations/supabase/client';
import { MarketingMaterial } from '@/types/product';

// Function to get all marketing materials
export const getMarketingMaterials = async (): Promise<MarketingMaterial[]> => {
  const { data, error } = await supabase
    .from('marketing_materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching marketing materials:", error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get marketing materials by category
export const getMarketingMaterialsByCategory = async (category: string): Promise<MarketingMaterial[]> => {
  const { data, error } = await supabase
    .from('marketing_materials')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching marketing materials for category ${category}:`, error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to upload a new marketing material
export const uploadMarketingMaterial = async (
  file: File,
  materialData: Omit<MarketingMaterial, 'id' | 'file_url' | 'created_at' | 'updated_at'>
): Promise<MarketingMaterial> => {
  try {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `marketing-materials/${fileName}`;
    
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('marketing-materials')
      .upload(filePath, file);
    
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    // 2. Get public URL for the uploaded file
    const { data: publicUrlData } = await supabase
      .storage
      .from('marketing-materials')
      .getPublicUrl(filePath);
      
    const file_url = publicUrlData.publicUrl;
    
    // 3. Save marketing material metadata to database
    const { data: material, error: dbError } = await supabase
      .from('marketing_materials')
      .insert([{
        title: materialData.title,
        description: materialData.description,
        file_url,
        file_type: file.type,
        category: materialData.category || 'General',
      }])
      .select('*')
      .single();
      
    if (dbError) {
      throw new Error(dbError.message);
    }
    
    return material;
  } catch (error) {
    console.error("Error uploading marketing material:", error);
    throw error;
  }
};

// Function to delete a marketing material
export const deleteMarketingMaterial = async (id: string): Promise<void> => {
  // First get the file URL
  const { data: material, error: fetchError } = await supabase
    .from('marketing_materials')
    .select('file_url')
    .eq('id', id)
    .single();
  
  if (fetchError) {
    console.error(`Error fetching marketing material with ID ${id}:`, fetchError);
    throw new Error(fetchError.message);
  }
  
  // Extract file path from URL
  if (material && material.file_url) {
    const filePath = material.file_url.split('/').pop();
    if (filePath) {
      // Delete file from storage
      const { error: storageError } = await supabase
        .storage
        .from('marketing-materials')
        .remove([`marketing-materials/${filePath}`]);
      
      if (storageError) {
        console.error(`Error deleting file from storage:`, storageError);
      }
    }
  }
  
  // Delete database entry
  const { error } = await supabase
    .from('marketing_materials')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting marketing material with ID ${id}:`, error);
    throw new Error(error.message);
  }
};
