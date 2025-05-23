
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
  const { items, totalItems } = useCart(); // Changed from itemCount to totalItems
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
  if (totalItems === 0) { // Changed from itemCount to totalItems
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
                  <CartItemList 
                    items={items}
                    onRemoveItem={(id) => useCart().removeFromCart(id)}
                    onUpdateQuantity={(id, qty) => useCart().updateQuantity(id, qty)}
                    onClearCart={() => useCart().clearCart()}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <OrderSummary 
                subtotal={subtotal} 
                selectedShippingOption={selectedOption}
                checkoutStep="cart"
                onProceedToShipping={() => setCheckoutStep('shipping')}
              />
            </div>
          </div>
        )}
        
        {checkoutStep === 'shipping' && (
          <ShippingStep
            shippingAddress={shippingAddress}
            onShippingAddressSubmit={handleShippingFormSubmit}
            shippingOptions={shippingOptions}
            selectedShippingOption={selectedShippingOption}
            onSelectShippingOption={setSelectedShippingOption}
            isLoadingShippingOptions={isLoadingShippingOptions}
            onBackToCart={goBackToCart}
            onContinueToPayment={() => setCheckoutStep('payment')}
          />
        )}
        
        {checkoutStep === 'payment' && (
          <PaymentStep 
            shippingAddress={shippingAddress!}
            selectedOption={selectedOption}
            bankDetails={bankDetails}
            isProcessingOrder={isProcessingOrder}
            onBackToShipping={goBackToShipping}
            onCompleteOrder={handleBankTransferCheckout}
            onEditShipping={() => setCheckoutStep('shipping')}
          />
        )}
      </div>
    </Layout>
  );
};

export default Cart;
