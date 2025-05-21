
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/services/productService';
import { Product } from '@/types/product';
import { Plus, Minus, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setQuantity(data.minQuantity);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleIncrementQuantity = () => {
    if (product) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrementQuantity = () => {
    if (product && quantity > product.minQuantity) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product && !isNaN(value) && value >= product.minQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="flex-1 h-96" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <div className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you are looking for does not exist.</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center"
          asChild
        >
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-auto object-cover aspect-square"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <h4 className="text-sm text-gray-500">Minimum Order</h4>
                <p>{product.minQuantity} units</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Available Stock</h4>
                <p>{product.stock} units</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-gray-700">Quantity:</span>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleDecrementQuantity}
                        disabled={quantity <= product.minQuantity}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={product.minQuantity}
                        max={product.stock}
                        className="w-20 mx-2 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleIncrementQuantity}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={quantity < product.minQuantity || quantity > product.stock}
                    >
                      Add to Cart
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/cart">View Cart</Link>
                    </Button>
                  </div>
                  {quantity > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Total: ${(product.price * quantity).toFixed(2)}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <p className="text-gray-600 mb-2">
                    Please log in to purchase this product.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/login">Login to Purchase</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/signup">Create Account</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
