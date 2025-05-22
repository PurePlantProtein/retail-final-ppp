import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProductForm from '@/components/ProductForm';
import { getProducts, deleteProduct, createProduct, updateProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus, AlertCircle, Copy, CloudArrowUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [error, setError] = useState<string | null>(null);
  const [migratingImages, setMigratingImages] = useState(false);
  
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
    
    loadProducts();
  }, [user, isAdmin, navigate, toast]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load products";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setActiveTab('edit');
  };

  const handleDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      toast({
        title: "Success",
        description: `Product "${productToDelete.name}" has been deleted.`,
      });
      loadProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      // Create a new product with the same data but a different ID
      const { id, ...productData } = product;
      // Append " (Copy)" to the name
      const duplicatedProduct = {
        ...productData,
        name: `${product.name} (Copy)`,
      };
      
      await createProduct(duplicatedProduct);
      toast({
        title: "Success",
        description: `Product "${product.name}" has been duplicated.`,
      });
      loadProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to duplicate product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleProductSaved = () => {
    loadProducts();
    if (activeTab === 'edit') {
      setActiveTab('list');
      setEditProduct(null);
    }
  };

  const migrateProductImages = async () => {
    setMigratingImages(true);
    setError(null);
    
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
      
      // Refresh products after migration
      await loadProducts();
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${successCount} images. Failed: ${failureCount}.`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to migrate images";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMigratingImages(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => migrateProductImages()} disabled={migratingImages} className="flex items-center gap-2">
              {migratingImages ? (
                <>Processing...</>
              ) : (
                <>
                  <CloudArrowUp className="h-4 w-4" />
                  Migrate Images to Storage
                </>
              )}
            </Button>
            <Button onClick={() => setActiveTab('add')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Product List</TabsTrigger>
            <TabsTrigger value="add">Add Product</TabsTrigger>
            {editProduct && (
              <TabsTrigger value="edit">Edit Product</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="list">
            {loading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No products found.</p>
                <Button onClick={() => setActiveTab('add')}>Add Your First Product</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
                        }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">${product.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-sm">Stock: {product.stock}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleDuplicateProduct(product)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeletePrompt(product)}
                          className="flex items-center gap-1"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
              <ProductForm onSuccess={handleProductSaved} />
            </div>
          </TabsContent>
          
          <TabsContent value="edit">
            {editProduct && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
                <ProductForm product={editProduct} onSuccess={handleProductSaved} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductsManagement;
