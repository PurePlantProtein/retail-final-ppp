
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useShipping } from '@/contexts/ShippingContext';
import { Order, ShippingOption, ShippingAddress } from '@/types/product';
import { calculateShippingOptions } from '@/services/shippingService';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/emailService';
import { normalizeOrder } from '@/utils/orderUtils';

export const useCartCheckout = (userId?: string, userEmail?: string) => {
  const { items, subtotal, clearCart, emailSettings } = useCart();
  const { shippingAddress: savedShippingAddress, setShippingAddress } = useShipping();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bankDetails] = useState({
    accountName: 'Pure Plant Protein',
    accountNumber: '12345678',
    reference: `ORDER-${Date.now()}`
  });
  
  // Shipping-related state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | undefined>();
  const [isLoadingShippingOptions, setIsLoadingShippingOptions] = useState(false);
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Use saved shipping address if available
  useEffect(() => {
    if (savedShippingAddress && !shippingAddress) {
      setShippingAddressState(savedShippingAddress);
    }
  }, [savedShippingAddress, shippingAddress]);

  // Calculate total weight for shipping
  const totalWeight = items.reduce((weight, item) => {
    return weight + (item.product.weight || 0.5) * item.quantity;
  }, 0);

  // Load shipping options when address is set
  useEffect(() => {
    if (shippingAddress && items.length > 0) {
      setIsLoadingShippingOptions(true);
      calculateShippingOptions(
        totalWeight,
        {
          postalCode: shippingAddress.postalCode,
          state: shippingAddress.state
        },
        items // Pass the cart items to check for free shipping eligibility
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

  const handleShippingFormSubmit = (data: ShippingAddress) => {
    setShippingAddressState(data);
    // Save to context (will also save to localStorage)
    setShippingAddress(data);
    setCheckoutStep('payment');
    
    toast({
      title: "Shipping Address Saved",
      description: "Your shipping details have been saved.",
    });
  };

  // Helper function to send order confirmation emails
  const sendOrderConfirmationEmails = async (order: Order) => {
    if (emailSettings.notifyCustomer && userEmail) {
      try {
        await sendOrderConfirmationEmail(order, userEmail);
      } catch (error) {
        console.error("Error sending customer email:", error);
      }
    }
    
    if (emailSettings.notifyAdmin) {
      try {
        await sendAdminOrderNotification(order, emailSettings.adminEmail);
      } catch (error) {
        console.error("Error sending admin email:", error);
      }
    }
  };

  // Create and save order function
  const createOrder = async () => {
    if (!selectedShippingOption || !shippingAddress) {
      throw new Error("Missing shipping information");
    }
    
    const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
    const shippingCost = selectedOption ? selectedOption.price : 0;
    const orderId = bankDetails.reference;
    
    // Create the order object and normalize it to ensure all properties are correct
    const orderData = {
      id: orderId,
      userId: userId || 'guest',
      userName: userEmail || 'guest',
      email: userEmail || 'guest@example.com', // Add a default email for guest users
      items: items.slice(), // Create a copy of the items array
      total: subtotal + shippingCost,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      paymentMethod: 'bank-transfer',
      shippingAddress: {...shippingAddress}, // Create a copy
      invoiceStatus: 'draft',
      // Store selectedOption's properties directly instead of the object reference
      // to avoid type issues when serializing/deserializing
      shippingOptionId: selectedOption?.id,
      shippingOptionName: selectedOption?.name,
      shippingOptionPrice: selectedOption?.price,
      shippingCarrier: selectedOption?.carrier,
    };
    
    // Normalize the order to ensure all fields are correct
    const normalizedOrder = normalizeOrder(orderData);
    
    console.log("Creating order:", normalizedOrder);
    
    // Get existing orders from localStorage or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Add new order
    existingOrders.push(normalizedOrder);
    
    // Store the orders in local storage
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    console.log("Orders saved:", existingOrders);

    // Send email confirmation
    sendOrderConfirmationEmails(normalizedOrder);
    
    return normalizedOrder;
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
      const order = createOrder();
      
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed. Please complete your bank transfer.",
      });
      
      // Clear the cart
      clearCart();
      
      // Navigate to the success page with order details
      navigate('/order-success', { state: { orderDetails: order } });
      
    } catch (error) {
      console.error("Error processing bank transfer order:", error);
      toast({
        title: "Order Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessingOrder(false);
    }
  };

  // Calculate the selected shipping cost
  const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
  const shippingCost = selectedOption ? selectedOption.price : 0;
  const totalWithShipping = subtotal + shippingCost;

  return {
    items,
    subtotal,
    totalWeight,
    totalWithShipping,
    bankDetails,
    shippingOptions,
    selectedShippingOption,
    selectedOption,
    shippingCost,
    shippingAddress,
    isProcessingOrder,
    isLoadingShippingOptions,
    checkoutStep,
    setCheckoutStep,
    setSelectedShippingOption,
    handleShippingFormSubmit,
    handleBankTransferCheckout,
  };
};
