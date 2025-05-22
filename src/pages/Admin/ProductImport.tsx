
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { ppProteinSampleProducts, importProducts } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
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

  const handleImport = async () => {
    try {
      setIsImporting(true);
      await importProducts(ppProteinSampleProducts);
      toast({
        title: "Import Successful",
        description: `${ppProteinSampleProducts.length} products have been imported.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin: Product Import</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Import PP Protein Products</CardTitle>
            <CardDescription>
              Import a sample set of PP Protein products to the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will import {ppProteinSampleProducts.length} sample products to your database.
              The products include protein powders, accessories, and supplements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ppProteinSampleProducts.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 flex flex-col items-center">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-32 w-32 object-contain mb-2"
                  />
                  <h3 className="font-medium text-center">{product.name}</h3>
                  <p className="text-sm text-center text-gray-500 mt-1">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? "Importing..." : "Import Products"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductImport;
