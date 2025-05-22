import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useShipping } from '@/contexts/ShippingContext';
import Layout from '@/components/Layout';
import { Trash2, Plus, Minus, CreditCard, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { loadPayPalScript, initPayPalButton } from '@/services/paypalService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateShippingOptions } from '@/services/shippingService';
import { ShippingOption, ShippingAddress, Order, PaymentMethod } from '@/types/product';
import ShippingOptions from '@/components/ShippingOptions';
import ShippingForm from '@/components/ShippingForm';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { shippingAddress: savedShippingAddress, setShippingAddress, isLoading: isLoadingShippingAddress } = useShipping();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const [isPaypalLoading, setIsPaypalLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    reference: `ORDER-${Date.now()}`
  });
  
  // Shipping-related state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | undefined>();
  const [isLoadingShippingOptions, setIsLoadingShippingOptions] = useState(false);
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Use saved shipping address if available
  useEffect(() => {
    if (!isLoadingShippingAddress && savedShippingAddress && !shippingAddress) {
      setShippingAddressState(savedShippingAddress);
    }
  }, [savedShippingAddress, isLoadingShippingAddress, shippingAddress]);

  // Calculate total weight for shipping
  const totalWeight = items.reduce((weight, item) => {
    return weight + (item.product.weight || 0.5) * item.quantity;
  }, 0);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  // Load shipping options when address is set
  useEffect(() => {
    if (shippingAddress && items.length > 0) {
      setIsLoadingShippingOptions(true);
      calculateShippingOptions(
        totalWeight,
        {
          postalCode: shippingAddress.postalCode,
          state: shippingAddress.state
        }
      ).then(options => {
        setShippingOptions(options);
        setSelectedShippingOption(options[0]?.id);
        setIsLoadingShippingOptions(false);
      }).catch(error => {
        console.error("Error calculating shipping:", error);
        setIsLoadingShippingOptions(false);
        toast({
          title: "Shipping Error",
          description: "Failed to calculate shipping options",
          variant: "destructive",
        });
      });
    }
  }, [shippingAddress, items, totalWeight, toast]);

  // Initialize PayPal SDK
  useEffect(() => {
    if (paymentMethod === 'paypal' && subtotal > 0 && user && checkoutStep === 'payment') {
      // Use sandbox Client ID (replace with your actual client ID)
      const clientId = "Aev56QXMEJq8AJhog4PGc3XGepFcoKONnrr6g093b45VZLpJEZ5I07Y8gMhJYGdfg7T5rQw1i7HRhQG1";
      
      setIsPaypalLoading(true);
      loadPayPalScript(clientId)
        .then(() => {
          if (paypalButtonRef.current) {
            const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
            const shippingCost = selectedOption ? selectedOption.price : 0;
            const totalWithShipping = subtotal + shippingCost;
            
            initPayPalButton(
              'paypal-button-container',
              totalWithShipping,
              (data) => handlePaypalSuccess(data),
              (error) => handlePaypalError(error)
            );
          }
          setIsPaypalLoading(false);
        })
        .catch(error => {
          console.error("Failed to load PayPal SDK:", error);
          toast({
            title: "PayPal Error",
            description: "Failed to load PayPal payment system",
            variant: "destructive",
          });
          setIsPaypalLoading(false);
        });
    }
  }, [paymentMethod, subtotal, user, checkoutStep, shippingOptions, selectedShippingOption]);

  const handleShippingFormSubmit = (data: ShippingAddress) => {
    setShippingAddressState(data);
    // Save to context (will also save to localStorage)
    setShippingAddress(data);
    setShowShippingForm(false);
    setCheckoutStep('payment');
    
    toast({
      title: "Shipping Address Saved",
      description: "Your shipping details have been saved.",
    });
  };

  // Create and save order function
  const createAndSaveOrder = (paymentMethod: PaymentMethod, paymentId?: string): Order => {
    if (!selectedShippingOption || !shippingAddress) {
      throw new Error("Missing shipping information");
    }
    
    const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
    const shippingCost = selectedOption ? selectedOption.price : 0;
    const orderId = paymentId || bankDetails.reference;
    
    // Create the order object
    const order: Order = {
      id: orderId,
      userId: user?.id || 'guest',
      userName: user?.email || 'guest',
      items: items.slice(), // Create a copy of the items array to prevent issues
      total: subtotal + shippingCost,
      status: paymentMethod === 'paypal' ? 'processing' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod: paymentMethod,
      shippingOption: selectedOption,
      shippingAddress: {...shippingAddress}, // Create a copy to prevent reference issues
      invoiceStatus: paymentMethod === 'paypal' ? 'paid' : 'draft'
    };
    
    console.log("Creating order:", order);
    
    // Get existing orders from localStorage or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Add new order
    existingOrders.push(order);
    
    // Store the orders in local storage
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    console.log("Orders saved:", existingOrders);
    
    return order;
  };

  const handleBankTransferCheckout = () => {
    if (isProcessingOrder) return;
    
    setIsProcessingOrder(true);
    
    try {
      if (!selectedShippingOption || !shippingAddress) {
        toast({
          title: "Missing Information",
          description: "Please provide shipping details before completing your order.",
          variant: "destructive",
        });
        setIsProcessingOrder(false);
        return;
      }
      
      // Process the bank transfer order
      const order = createAndSaveOrder('bank-transfer');
      
      toast({
        title: "Bank Transfer Order Placed",
        description: "Please complete your bank transfer using the provided details. Your order will be processed after payment confirmation.",
      });
      
      toast({
        title: "Order reference: " + order.id,
        description: "Please include this reference with your bank transfer.",
      });
      
      // Clear the cart
      clearCart();
      
      // Navigate to the orders page after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      console.error("Error processing bank transfer order:", error);
      toast({
        title: "Order Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaypalSuccess = (data: any) => {
    if (isProcessingOrder) return;
    
    setIsProcessingOrder(true);
    
    try {
      if (!selectedShippingOption || !shippingAddress) {
        toast({
          title: "Missing Information",
          description: "Please provide shipping details before completing your order.",
          variant: "destructive",
        });
        setIsProcessingOrder(false);
        return;
      }
      
      console.log("PayPal payment successful:", data);
      
      // Process the PayPal order
      const order = createAndSaveOrder('paypal', data.orderID);
      
      toast({
        title: "PayPal Payment Successful",
        description: `Your payment (ID: ${data.orderID}) has been processed successfully.`,
      });
      
      // Clear the cart
      clearCart();
      
      // Navigate to the orders page after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      console.error("Error processing PayPal order:", error);
      toast({
        title: "Order Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaypalError = (error: any) => {
    console.error("PayPal payment error:", error);
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your PayPal payment.",
      variant: "destructive",
    });
  };

  // Calculate the selected shipping cost
  const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
  const shippingCost = selectedOption ? selectedOption.price : 0;
  const totalWithShipping = subtotal + shippingCost;

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-16">
              <p className="mb-6 text-gray-500">Please log in to view your cart</p>
              <div className="flex space-x-4">
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-16">
              <p className="mb-6 text-gray-500">Your cart is empty</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {checkoutStep === 'cart' && (
                <>
                  {items.map((item) => (
                    <Card key={item.product.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <Link 
                            to={`/products/${item.product.id}`}
                            className="sm:w-1/4 flex-shrink-0"
                          >
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="w-full h-36 sm:h-full object-cover"
                            />
                          </Link>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                              <Link 
                                to={`/products/${item.product.id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => handleRemoveItem(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <p className="text-gray-600 text-sm my-2 line-clamp-2">
                              {item.product.description}
                            </p>
                            
                            <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
                              <div className="flex items-center">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= item.product.minQuantity}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input 
                                  type="text"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleQuantityChange(item.product.id, value);
                                    }
                                  }}
                                  className="w-16 h-8 text-center mx-2"
                                />
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                <p className="font-medium">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ${item.product.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => clearCart()}
                    >
                      Clear Cart
                    </Button>
                    <Button asChild variant="ghost">
                      <Link to="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </>
              )}
              
              {checkoutStep === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shippingAddress && !showShippingForm ? (
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-md">
                          <p className="font-medium">{shippingAddress.name}</p>
                          <p>{shippingAddress.street}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                          <p>{shippingAddress.country}</p>
                          <p>Phone: {shippingAddress.phone}</p>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => setShowShippingForm(true)}
                        >
                          Edit Address
                        </Button>
                      </div>
                    ) : (
                      <ShippingForm 
                        onSubmit={handleShippingFormSubmit} 
                        defaultValues={shippingAddress || undefined}
                      />
                    )}
                    
                    {shippingAddress && (
                      <>
                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-4">Shipping Options</h3>
                          <ShippingOptions 
                            shippingOptions={shippingOptions}
                            selectedOption={selectedShippingOption}
                            onSelect={setSelectedShippingOption}
                            isLoading={isLoadingShippingOptions}
                          />
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setCheckoutStep('cart')}
                          >
                            Back to Cart
                          </Button>
                          <Button
                            onClick={() => setCheckoutStep('payment')}
                            disabled={!selectedShippingOption}
                          >
                            Continue to Payment
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {checkoutStep === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible defaultValue="shipping">
                      <AccordionItem value="shipping">
                        <AccordionTrigger>Shipping Address</AccordionTrigger>
                        <AccordionContent>
                          {shippingAddress && (
                            <div className="bg-muted p-4 rounded-md">
                              <p className="font-medium">{shippingAddress.name}</p>
                              <p>{shippingAddress.street}</p>
                              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                              <p>{shippingAddress.country}</p>
                              <p>Phone: {shippingAddress.phone}</p>
                            </div>
                          )}
                          <Button 
                            variant="link"
                            onClick={() => setCheckoutStep('shipping')}
                            className="mt-2 px-0"
                          >
                            Edit
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="shipping-method">
                        <AccordionTrigger>Shipping Method</AccordionTrigger>
                        <AccordionContent>
                          {selectedOption && (
                            <div className="bg-muted p-4 rounded-md">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{selectedOption.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedOption.description}
                                  </p>
                                  <p className="text-sm">
                                    Estimated delivery: {selectedOption.estimatedDeliveryDays}
                                  </p>
                                  <div className="flex items-center text-xs mt-1">
                                    <span className={`inline-block h-3 w-3 rounded-full mr-1 ${
                                      selectedOption.carrier === 'australia-post' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></span>
                                    <span className="capitalize">
                                      {selectedOption.carrier === 'australia-post' ? 'Australia Post' : 'Transdirect'}
                                    </span>
                                  </div>
                                </div>
                                <div className="font-medium">
                                  ${selectedOption.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                          <Button 
                            variant="link"
                            onClick={() => setCheckoutStep('shipping')}
                            className="mt-2 px-0"
                          >
                            Change
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div className="mt-6">
                      <Tabs 
                        defaultValue="paypal" 
                        className="w-full" 
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as 'bank-transfer' | 'paypal')}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="bank-transfer">Bank Transfer</TabsTrigger>
                          <TabsTrigger value="paypal">PayPal</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="bank-transfer" className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Bank Details</p>
                            <div className="space-y-1.5 text-sm">
                              <p><span className="font-medium">Bank:</span> Pure Plant Protein Bank</p>
                              <p><span className="font-medium">Account Name:</span> Pure Plant Protein</p>
                              <p><span className="font-medium">Account #:</span> 12345678</p>
                              <p><span className="font-medium">Reference:</span> {bankDetails.reference}</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handleBankTransferCheckout}
                            disabled={isProcessingOrder}
                          >
                            {isProcessingOrder ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" /> Complete Order
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-center text-gray-500">
                            Include the reference number when making your bank transfer
                          </p>
                        </TabsContent>
                        
                        <TabsContent value="paypal" className="mt-4">
                          {isPaypalLoading || isProcessingOrder ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : (
                            <div 
                              id="paypal-button-container" 
                              ref={paypalButtonRef}
                              className="min-h-[40px]"
                            ></div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep('shipping')}
                      className="mt-6"
                      disabled={isProcessingOrder}
                    >
                      Back to Shipping
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="w-full md:w-72 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {selectedOption ? (
                      <span>${selectedOption.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {checkoutStep === 'cart' ? 'Calculated at checkout' : 'Select shipping option'}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${totalWithShipping.toFixed(2)}</span>
                  </div>
                  
                  {checkoutStep === 'cart' && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => setCheckoutStep('shipping')}
                    >
                      <Truck className="mr-2 h-4 w-4" /> Proceed to Shipping
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="flex-col">
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Secure checkout powered by PayPal & Bank Transfer
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
