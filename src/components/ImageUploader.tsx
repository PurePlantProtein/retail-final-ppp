
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImageUrl, 
  onImageUploaded,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 2) {
      toast({
        title: "File too large",
        description: "Image size should not exceed 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create a unique file name to prevent overwriting
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      
      // Set the preview image
      setPreviewUrl(publicUrl);
      
      // Call the callback with the URL
      onImageUploaded(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your product image has been uploaded.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Product preview" 
            className="max-w-full h-48 object-contain border rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-8 text-center">
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Upload a product image</p>
        </div>
      )}
      
      <div>
        <Input
          type="file"
          accept="image/*"
          id="image-upload"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <label htmlFor="image-upload">
          <Button
            variant="outline"
            className="w-full"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
