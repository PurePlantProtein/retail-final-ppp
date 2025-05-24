
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Grid, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/ProductTable';

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Update selected category when URL params change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Filter out any products that are just category placeholders
  const filteredProducts = products?.filter(product => {
    // Filter out products that have "Category", "Placeholder", or "category" in their name
    return !(
      product.name.includes("Category") || 
      product.name.includes("Placeholder") ||
      product.name.includes("category") ||
      product.price === 0
    );
  });

  // Extract categories from filtered products
  const categories = filteredProducts 
    ? [...new Set(filteredProducts.map(product => product.category))].filter(Boolean) 
    : [];

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    if (category === selectedCategory) {
      // If clicking the same category, clear the filter
      setSelectedCategory(null);
      navigate('/products');
    } else {
      // If clicking a different category, apply that filter
      setSelectedCategory(category);
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  };

  // Filter products by selected category, but first filter out placeholders
  const displayProducts = selectedCategory 
    ? filteredProducts?.filter(product => product.category === selectedCategory) 
    : filteredProducts;

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'table' : 'grid');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4 text-left">Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-left">
          <h1 className="text-2xl font-bold mb-4">Products</h1>
          <p className="text-red-500">Error loading products. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-left">Products</h1>
          <Button 
            variant="outline" 
            onClick={toggleViewMode}
            className="flex items-center gap-2"
          >
            {viewMode === 'grid' ? (
              <>
                <TableIcon className="h-4 w-4" />
                Table View
              </>
            ) : (
              <>
                <Grid className="h-4 w-4" />
                Grid View
              </>
            )}
          </Button>
        </div>
        
        {/* Categories section */}
        <div className="mb-6 text-left">
          <h2 className="text-lg font-medium mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className="flex items-center gap-1"
              >
                {category === selectedCategory && <ClipboardCheck className="h-4 w-4" />}
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Products view - grid or table */}
        {displayProducts && displayProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <ProductTable products={displayProducts} />
          )
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedCategory ? 
                `No products found in the ${selectedCategory} category.` : 
                "No products available."
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
