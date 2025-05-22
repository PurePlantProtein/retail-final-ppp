
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Product, CategoryDisplay } from '@/types/product';
import { getProducts, getCategories } from '@/services/productService';
import { Search } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import CategoryCard from '@/components/CategoryCard'; // We'll create this component

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryObjects, setCategoryObjects] = useState<CategoryDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const categoryParam = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productData = await getProducts();
        const categoryData = await getCategories();
        
        setProducts(productData);
        setCategories(categoryData);
        
        // Create category objects from category names
        const categoryDisplays = categoryData
          .filter(cat => cat) // Filter out null or undefined
          .map(cat => ({
            id: cat,
            name: cat,
            description: `Browse all products in the ${cat} category`,
            image: null,
            isCategory: true as const
          }));
          
        setCategoryObjects(categoryDisplays);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter products based on search query and category
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryParam !== 'all') {
      filtered = filtered.filter(
        product => product.category === categoryParam
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const handleCategoryChange = (value: string) => {
    searchParams.set('category', value);
    setSearchParams(searchParams);
  };

  const updateSearchParams = () => {
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  // Determine what to render based on the category filter
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="p-4">
                <AspectRatio ratio={1/1}>
                  <Skeleton className="h-full w-full" />
                </AspectRatio>
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      );
    }
    
    // If viewing all categories and no search is active, show categories first
    if (categoryParam === 'all' && !searchQuery) {
      return (
        <div className="space-y-8">
          {/* Categories Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categoryObjects.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
          
          {/* Products Section */}
          {filteredProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // If a category is selected or search is active, show filtered products
    return (
      <div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">
              Try changing your search query or category filter.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
          <h1 className="text-3xl font-bold">Products</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pr-10"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Select value={categoryParam} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    category && (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    )
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </Layout>
  );
};

export default Products;
