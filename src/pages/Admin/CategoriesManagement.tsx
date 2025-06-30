import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories, addCategory, deleteCategory, getProducts } from '@/services/productService';
import { AlertCircle, Plus, Tag, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/product';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  
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
    loadCategories();
    loadProductCounts();
  }, [user, isAdmin, navigate, toast]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const products = await getProducts();
      // Count products per category id
      const counts: Record<string, number> = {};
      products.forEach((product) => {
        const catId = product.category?.id;
        if (catId) {
          counts[catId] = (counts[catId] || 0) + 1;
        } else {
          counts['uncategorized'] = (counts['uncategorized'] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load product counts';
      setError(errorMessage);
      console.error('Error loading product counts:', errorMessage);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Category name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Category already exists',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newCat = await addCategory(newCategoryName);
      toast({
        title: 'Success',
        description: `Category "${newCategoryName}" has been added.`,
      });
      setNewCategoryName('');
      loadCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add category';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      toast({
        title: 'Success',
        description: `Category "${categoryToDelete.name}" has been deleted.`,
      });
      loadCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Category Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <Tag className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Categories Found</h3>
            <p className="text-gray-500 mb-4">Create your first category to organize your products.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Your First Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category-name-empty">Category Name</Label>
                    <Input
                      id="category-name-empty"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category cards */}
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeletePrompt(category)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Products in this category:
                    <span className="font-medium ml-1">
                      {productCounts[category.id] ?? 0}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
            {/* Uncategorized products card */}
            <Card key="uncategorized">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">
                  Uncategorized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Products in this category:
                  <span className="font-medium ml-1">
                    {productCounts['uncategorized'] ?? 0}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
              This may affect products using this category.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CategoriesManagement;
