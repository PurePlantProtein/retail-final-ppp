
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CloudUpload } from 'lucide-react';
import { Product } from '@/types/product';
import { updateProduct } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageMigrationButtonProps {
  products: Product[];
  onSuccess: () => void;
}

const ImageMigrationButton: React.FC<ImageMigrationButtonProps> = ({ products, onSuccess }) => {
  const [migratingImages, setMigratingImages] = useState(false);
  const { toast } = useToast();

  const migrateProductImages = async () => {
    setMigratingImages(true);
    
    try {
      let successCount = 0;
      let failureCount = 0;
      
      // Process products in batches to avoid timeout
      for (const product of products) {
        if (!product.image || product.image.includes('storage.googleapis.com')) {
          // Skip products that don't have an image or are already in Supabase Storage
          continue;
        }
        
        try {
          // Download the image
          const response = await fetch(product.image);
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
          
          const blob = await response.blob();
          
          // Create a unique filename
          const fileExt = product.image.split('.').pop()?.split('?')[0] || 'png';
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(fileName, blob);
            
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(fileName);
            
          const publicUrl = publicUrlData.publicUrl;
          
          // Update the product with the new image URL
          await updateProduct(product.id, { image: publicUrl });
          
          successCount++;
        } catch (err) {
          console.error(`Failed to migrate image for product ${product.id}:`, err);
          failureCount++;
        }
      }
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${successCount} images. Failed: ${failureCount}.`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      
      // Refresh products after migration
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to migrate images";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMigratingImages(false);
    }
  };

  return (
    <Button onClick={() => migrateProductImages()} disabled={migratingImages} className="flex items-center gap-2">
      {migratingImages ? (
        <>Processing...</>
      ) : (
        <>
          <CloudUpload className="h-4 w-4" />
          Migrate Images to Storage
        </>
      )}
    </Button>
  );
};

export default ImageMigrationButton;
