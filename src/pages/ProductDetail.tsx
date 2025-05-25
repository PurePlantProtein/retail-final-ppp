import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductImage from '@/components/product/ProductImage';
import ProductDetailTabs from '@/components/product/ProductDetailTabs';
import ProductSpecifications from '@/components/product/ProductSpecifications';
import ProductPurchaseForm from '@/components/product/ProductPurchaseForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserPricingTier } from '@/hooks/usePricingTiers';
import { mapProductForClient } from '@/utils/productUtils';
import { Product } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { userTier } = useUserPricingTier(user?.id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Map the database product to our frontend Product type
        const mappedProduct = mapProductForClient(data);
        setProduct(mappedProduct);
      } catch (error: any) {
        console.error("Error fetching product:", error.message);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
        navigate('/products');
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, toast]);

  const handleIncrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrementQuantity = () => {
    if (product && quantity > (product.min_quantity || 1)) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product) {
      const min = product.min_quantity || 1;
      if (!isNaN(value) && value >= min && value <= product.stock) {
        setQuantity(value);
      }
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${product.name} x ${quantity} has been added to your cart.`,
      });
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="order-1 lg:order-1">
            <ProductImage image={product.image} name={product.name} />
          </div>
          
          <div className="order-2 lg:order-2 space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg sm:text-xl text-gray-700 font-semibold">
                  ${product.price.toFixed(2)}
                </p>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ProductPurchaseForm
              user={user}
              price={product.price}
              stock={product.stock}
              quantity={quantity}
              category={product.category || ''}
              handleIncrementQuantity={handleIncrementQuantity}
              handleDecrementQuantity={handleDecrementQuantity}
              handleQuantityChange={handleQuantityChange}
              handleAddToCart={handleAddToCart}
              minQuantity={product.min_quantity}
              categoryMOQ={undefined}
            />
          </div>
        </div>
        
        <div className="mt-8 lg:mt-12">
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
