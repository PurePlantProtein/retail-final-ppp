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
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const navigate = useNavigate();

  // Add a utility function to get category MOQ
  const getCategoryMOQ = (category: string): number | undefined => {
    // Here we define the MOQ values for different categories
    const categoryMOQs: Record<string, number> = {
      'Protein Powder': 12,
      // Add more categories with their MOQ as needed
    };

    return categoryMOQs[category];
  };

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

  // Handle quantity changes in the component
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleIncrementQuantity = () => {
    const categoryMOQ = getCategoryMOQ(product?.category || '');
    const minQty = Math.max(product?.min_quantity || 1, categoryMOQ || 1);
    
    if (quantity < (product?.stock || 0)) {
      setQuantity(prevQty => prevQty + 1);
    }
  };

  const handleDecrementQuantity = () => {
    const categoryMOQ = getCategoryMOQ(product?.category || '');
    const minQty = Math.max(product?.min_quantity || 1, categoryMOQ || 1);
    
    if (quantity > minQty) {
      setQuantity(prevQty => prevQty - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const categoryMOQ = getCategoryMOQ(product.category || '');
    const minQty = Math.max(product.min_quantity || 1, categoryMOQ || 1);
    
    if (quantity < minQty) {
      toast({
        title: "Minimum quantity not met",
        description: `You must order at least ${minQty} units of this product.`,
        variant: "destructive"
      });
      return;
    }
    
    addToCart(product, quantity);
    navigate('/cart');
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
              category={product.category || ''}
              quantity={quantity}
              handleIncrementQuantity={handleIncrementQuantity}
              handleDecrementQuantity={handleDecrementQuantity}
              handleQuantityChange={handleQuantityChange}
              handleAddToCart={handleAddToCart}
              minQuantity={product.min_quantity}
              categoryMOQ={getCategoryMOQ(product.category || '')}
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
