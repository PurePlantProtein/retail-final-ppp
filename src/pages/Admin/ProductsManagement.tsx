
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProductForm from '@/components/ProductForm';
import { getProducts, deleteProduct, createProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductsList from '@/components/admin/ProductsList';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import ImageMigrationButton from '@/components/admin/ImageMigrationButton';

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [error, setError] = useState<string | null>(null);
  
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

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex gap-2">
            <ImageMigrationButton 
              products={products}
              onSuccess={loadProducts}
            />
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
            <ProductsList
              products={products}
              loading={loading}
              onEditProduct={handleEditProduct}
              onDeletePrompt={handleDeletePrompt}
              onDuplicateProduct={handleDuplicateProduct}
            />
            {products.length === 0 && !loading && (
              <div className="text-center">
                <Button onClick={() => setActiveTab('add')}>Add Your First Product</Button>
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        product={productToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </Layout>
  );
};

export default ProductsManagement;
