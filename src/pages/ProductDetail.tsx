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

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  category: string;
  specifications: any;
  min_quantity?: number;
  category_moq?: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
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

        setProduct(data);
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
    if (product && quantity > (product.category_moq || product.min_quantity || 1)) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product) {
      const min = product.category_moq || product.min_quantity || 1;
      if (!isNaN(value) && value >= min && value <= product.stock) {
        setQuantity(value);
      }
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${product.name} x ${quantity} has been added to your cart.`,
      });
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImage images={product.images} name={product.name} />
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700">${product.price.toFixed(2)}</p>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <ProductPurchaseForm
              user={user}
              price={product.price}
              stock={product.stock}
              quantity={quantity}
              category={product.category}
              handleIncrementQuantity={handleIncrementQuantity}
              handleDecrementQuantity={handleDecrementQuantity}
              handleQuantityChange={handleQuantityChange}
              handleAddToCart={handleAddToCart}
              minQuantity={product.min_quantity}
              categoryMOQ={product.category_moq}
              discountPercentage={userTier?.tier?.discount_percentage}
            />
            <ProductDetailTabs>
              <ProductSpecifications specifications={product.specifications} />
            </ProductDetailTabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
