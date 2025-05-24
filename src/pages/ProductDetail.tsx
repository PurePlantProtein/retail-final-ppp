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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setQuantity(1); // Default to 1 instead of minQuantity
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
    if (product && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product && !isNaN(value) && value >= 1) {
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
        <div className="container mx-auto px-4 py-16 text-left">
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
                  src={product?.image} 
                  alt={product?.name}
                  className="w-full h-auto object-cover aspect-square"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://ppprotein.com.au/cdn/shop/files/ppprotein-circles_180x.png';
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-left">{product?.name}</h1>
              <p className="text-xl font-semibold text-primary">${product?.price.toFixed(2)}</p>
            </div>
            
            {/* Product specifications */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <h4 className="text-sm text-gray-500">Available Stock</h4>
                <p className="text-left">{product?.stock} units</p>
              </div>
              
              {/* Product details */}
              {product?.servingSize && (
                <div>
                  <h4 className="text-sm text-gray-500">Serving Size</h4>
                  <p className="text-left">{product.servingSize}</p>
                </div>
              )}
              
              {product?.numberOfServings !== undefined && (
                <div>
                  <h4 className="text-sm text-gray-500">Number of Servings</h4>
                  <p className="text-left">{product.numberOfServings}</p>
                </div>
              )}
              
              {product?.bagSize && (
                <div>
                  <h4 className="text-sm text-gray-500">Bag Size</h4>
                  <p className="text-left">{product.bagSize}</p>
                </div>
              )}
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
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={1}
                        max={product?.stock}
                        className="w-20 mx-2 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleIncrementQuantity}
                        disabled={quantity >= (product?.stock || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={quantity < 1 || quantity > (product?.stock || 0)}
                    >
                      Add to Cart
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/cart">View Cart</Link>
                    </Button>
                  </div>
                  {quantity > 0 && product && (
                    <p className="mt-4 text-sm text-gray-600 text-left">
                      Total: ${(product.price * quantity).toFixed(2)}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <p className="text-gray-600 mb-2 text-left">
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
        
        {/* Product details tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              {product.ingredients && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
              {product.aminoAcidProfile && product.aminoAcidProfile.length > 0 && (
                <TabsTrigger value="amino">Amino Acid Profile</TabsTrigger>
              )}
              {product.nutritionalInfo && product.nutritionalInfo.length > 0 && (
                <TabsTrigger value="nutritional">Nutritional Info</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="description" className="py-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-left">Description</h2>
                  <p className="text-gray-700 text-left">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {product.ingredients && (
              <TabsContent value="ingredients" className="py-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-left">Ingredients</h2>
                    <p className="text-gray-700 text-left">{product.ingredients}</p>
                    
                    {/* Certifications and badges */}
                    <div className="mt-6">
                      <p className="text-gray-700 mb-3 text-left">
                        Gluten Free | Dairy Free | Vegan Friendly | GMO Free | Halal and Kosher Certified
                      </p>
                      <div className="border border-green-600 rounded p-4 inline-flex items-center text-green-700">
                        <span className="font-medium text-left">
                          Produced in Australia from 90% Australian ingredients.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {product.aminoAcidProfile && product.aminoAcidProfile.length > 0 && (
              <TabsContent value="amino" className="py-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-left">Amino Acid Profile</h2>
                    <p className="text-sm text-gray-500 mb-4 text-left">Total per serve ({product.servingSize || '30g'})</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {product.aminoAcidProfile.map((amino, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                              <td className="py-3 px-4 text-left">{amino.name}</td>
                              <td className="py-3 px-4 text-right">{amino.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {product.nutritionalInfo && product.nutritionalInfo.length > 0 && (
              <TabsContent value="nutritional" className="py-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-left">Nutritional Info</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4"></th>
                            <th className="text-right py-3 px-4">Per {product.servingSize || '30g'}</th>
                            <th className="text-right py-3 px-4">Per 100g</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.nutritionalInfo.map((info, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                              <td className="py-3 px-4 text-left">{info.name}</td>
                              <td className="py-3 px-4 text-right">{info.perServing}</td>
                              <td className="py-3 px-4 text-right">{info.per100g}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
