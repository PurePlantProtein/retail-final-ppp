
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import LoginRequired from '@/components/cart/LoginRequired';
import EmptyCart from '@/components/cart/EmptyCart';
import CartItemList from '@/components/cart/CartItemList';
import OrderSummary from '@/components/cart/OrderSummary';
import ShippingStep from '@/components/cart/ShippingStep';
import PaymentStep from '@/components/cart/PaymentStep';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCartCheckout } from '@/hooks/useCartCheckout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { items, itemCount } = useCart();
  const { user } = useAuth();
  const {
    checkoutStep,
    setCheckoutStep,
    handleShippingFormSubmit,
    handleBankTransferCheckout,
    isProcessingOrder,
    shippingAddress,
    shippingOptions,
    selectedOption,
    selectedShippingOption,
    setSelectedShippingOption,
    isLoadingShippingOptions,
    subtotal,
    totalWithShipping,
    bankDetails
  } = useCartCheckout();

  // Fix: Removing the extra arguments in setCheckoutStep call
  const goBackToCart = () => setCheckoutStep('cart');
  
  // Fix: Removing the extra arguments in setCheckoutStep call
  const goBackToShipping = () => setCheckoutStep('shipping');

  // If no items in cart, show empty cart view
  if (itemCount === 0) {
    return (
      <Layout>
        <EmptyCart />
      </Layout>
    );
  }

  // If no logged in user, show login required
  if (!user) {
    return (
      <Layout>
        <LoginRequired />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {checkoutStep !== 'cart' && (
          <Button 
            variant="ghost" 
            onClick={checkoutStep === 'payment' ? goBackToShipping : goBackToCart} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {checkoutStep === 'payment' ? 'Shipping' : 'Cart'}
          </Button>
        )}
        
        {checkoutStep === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <CartItemList />
                </CardContent>
              </Card>
            </div>
            <div>
              <OrderSummary 
                subtotal={subtotal} 
                shippingCost={0} 
                total={subtotal} 
                onCheckout={() => setCheckoutStep('shipping')}
              />
            </div>
          </div>
        )}
        
        {checkoutStep === 'shipping' && (
          <ShippingStep
            onSubmit={handleShippingFormSubmit}
            shippingOptions={shippingOptions}
            selectedShippingOption={selectedShippingOption}
            setSelectedShippingOption={setSelectedShippingOption}
            isLoading={isLoadingShippingOptions}
            savedAddress={shippingAddress}
          />
        )}
        
        {checkoutStep === 'payment' && (
          <PaymentStep 
            subtotal={subtotal}
            shipping={selectedOption?.price || 0}
            total={totalWithShipping}
            bankDetails={bankDetails}
            onPay={handleBankTransferCheckout}
            isProcessing={isProcessingOrder}
          />
        )}
      </div>
    </Layout>
  );
};

export default Cart;
