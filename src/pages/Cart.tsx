
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useShipping } from '@/contexts/ShippingContext';
import { useCartCheckout } from '@/hooks/useCartCheckout';

// Import components
import CartItemList from '@/components/cart/CartItemList';
import EmptyCart from '@/components/cart/EmptyCart';
import LoginRequired from '@/components/cart/LoginRequired';
import OrderSummary from '@/components/cart/OrderSummary';
import ShippingStep from '@/components/cart/ShippingStep';
import PaymentStep from '@/components/cart/PaymentStep';

const Cart = () => {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { shippingAddress: savedShippingAddress, isLoading: isLoadingShippingAddress } = useShipping();
  
  const {
    subtotal,
    bankDetails,
    shippingOptions,
    selectedShippingOption,
    selectedOption,
    shippingAddress,
    isProcessingOrder,
    isLoadingShippingOptions,
    checkoutStep,
    setCheckoutStep,
    setSelectedShippingOption,
    handleShippingFormSubmit,
    handleBankTransferCheckout,
  } = useCartCheckout(user?.id, user?.email);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          <LoginRequired />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {checkoutStep === 'cart' && (
                <CartItemList
                  items={items}
                  onRemoveItem={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  onClearCart={clearCart}
                />
              )}
              
              {checkoutStep === 'shipping' && shippingAddress && (
                <ShippingStep
                  shippingAddress={shippingAddress}
                  onShippingAddressSubmit={handleShippingFormSubmit}
                  shippingOptions={shippingOptions}
                  selectedShippingOption={selectedShippingOption}
                  onSelectShippingOption={setSelectedShippingOption}
                  isLoadingShippingOptions={isLoadingShippingOptions}
                  onBackToCart={() => setCheckoutStep('cart')}
                  onContinueToPayment={() => setCheckoutStep('payment')}
                />
              )}
              
              {checkoutStep === 'payment' && shippingAddress && (
                <PaymentStep
                  shippingAddress={shippingAddress}
                  selectedOption={selectedOption}
                  bankDetails={bankDetails}
                  isProcessingOrder={isProcessingOrder}
                  onBackToShipping={() => setCheckoutStep('shipping')}
                  onCompleteOrder={handleBankTransferCheckout}
                  onEditShipping={() => setCheckoutStep('shipping')}
                />
              )}
            </div>
            
            <div className="w-full md:w-72 h-fit">
              <OrderSummary
                subtotal={subtotal}
                selectedShippingOption={selectedOption}
                checkoutStep={checkoutStep}
                onProceedToShipping={() => setCheckoutStep('shipping')}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
