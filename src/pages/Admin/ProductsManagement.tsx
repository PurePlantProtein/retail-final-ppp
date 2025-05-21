
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProductForm from '@/components/ProductForm';
import { getProducts, deleteProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus } from 'lucide-react';

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
    }
  }, [user, isAdmin, navigate, toast]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to delete product",
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
          <Button onClick={() => setActiveTab('add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
        
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
                      <div className="flex gap-2">
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
