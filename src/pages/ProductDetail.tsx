
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/services/productService';
import { Product } from '@/types/product';
import { ArrowLeft } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import ProductSpecifications from '@/components/product/ProductSpecifications';
import ProductPurchaseForm from '@/components/product/ProductPurchaseForm';
import ProductDetailTabs from '@/components/product/ProductDetailTabs';

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
          setQuantity(1);
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
            <ProductImage image={product.image} name={product.name} />
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-left">{product.name}</h1>
              <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
            </div>
            
            <ProductSpecifications 
              stock={product.stock}
              servingSize={product.servingSize}
              numberOfServings={product.numberOfServings}
              bagSize={product.bagSize}
            />
            
            <ProductPurchaseForm 
              user={user}
              price={product.price}
              stock={product.stock}
              quantity={quantity}
              handleIncrementQuantity={handleIncrementQuantity}
              handleDecrementQuantity={handleDecrementQuantity}
              handleQuantityChange={handleQuantityChange}
              handleAddToCart={handleAddToCart}
            />
          </div>
        </div>
        
        <div className="mt-12">
          <ProductDetailTabs 
            description={product.description}
            ingredients={product.ingredients || undefined}
            aminoAcidProfile={product.aminoAcidProfile}
            nutritionalInfo={product.nutritionalInfo}
            servingSize={product.servingSize}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
