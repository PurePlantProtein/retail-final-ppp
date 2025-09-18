import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useShipping } from '@/contexts/ShippingContext';
import { Order, ShippingOption, ShippingAddress } from '@/types/product';
import { calculateShippingOptions } from '@/services/shippingService';
import { 
  sendOrderConfirmationEmail, 
  sendAdminOrderNotification, 
  sendDispatchOrderNotification, 
  sendAccountsOrderNotification 
} from '@/services/emailService';
import { normalizeOrder } from '@/utils/orderUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
// import { useOrders } from '@/hooks/useOrders';

export const useCartCheckout = () => {
  const { 
    items, 
    subtotal, 
    clearCart, 
    emailSettings 
  } = useCart();
  
  const { user } = useAuth();
  const { shippingAddress: savedShippingAddress, setShippingAddress } = useShipping();
  const navigate = useNavigate();
  const { toast } = useToast();
  // const { handleTrackingSubmit } = useOrders();

  const [bankDetails] = useState({
    accountName: 'JMP Foods Pty Ltd',
    accountNumber: '611680986',
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
        // Always select the first option (free shipping) by default
        if (options.length > 0) {
          setSelectedShippingOption(options[0].id);
        }
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
    setShippingAddress(data, user?.id);
    setCheckoutStep('payment');
    
    toast({
      title: "Shipping Address Saved",
      description: "Your shipping details have been saved.",
    });
  };

  // Helper function to send order confirmation emails
  const sendOrderConfirmationEmails = async (order: Order) => {
  const emailResults = {
      customerEmailSent: false,
      adminEmailSent: false,
      dispatchEmailSent: false,
      accountsEmailSent: false
    };
    
    // Send customer email
    if (emailSettings.notifyCustomer && order.email) {
      try {
        const customerResult = await sendOrderConfirmationEmail(order, order.email, 'customer');
        emailResults.customerEmailSent = customerResult.success;
        console.log('Customer email result:', customerResult);
      } catch (error) {
        console.error("Error sending customer email:", error);
      }
    }
    
    // Send admin (sales) email
    if (emailSettings.notifyAdmin && emailSettings.adminEmail) {
      try {
        const adminResult = await sendAdminOrderNotification(order, emailSettings.adminEmail);
        emailResults.adminEmailSent = adminResult.success;
        console.log('Admin email result:', adminResult);
      } catch (error) {
        console.error("Error sending admin email:", error);
      }
    }
    
    // Send dispatch email
    if (emailSettings.notifyDispatch && emailSettings.dispatchEmail) {
      try {
        const dispatchResult = await sendDispatchOrderNotification(order, emailSettings.dispatchEmail);
        emailResults.dispatchEmailSent = dispatchResult.success;
        console.log('Dispatch email result:', dispatchResult);
      } catch (error) {
        console.error("Error sending dispatch email:", error);
      }
    }
    
    // Send accounts email
    if (emailSettings.notifyAccounts && emailSettings.accountsEmail) {
      try {
        const accountsResult = await sendAccountsOrderNotification(order, emailSettings.accountsEmail);
        emailResults.accountsEmailSent = accountsResult.success;
        console.log('Accounts email result:', accountsResult);
      } catch (error) {
        console.error("Error sending accounts email:", error);
      }
    }
    
    return emailResults;
  };

  // Create and save order function
  const createOrderInDatabase = async (orderData: any) => {
    console.log('Creating order with data:', orderData);
    
    // Convert items to JSON-compatible format for database
    const dbOrderData = {
      ...orderData,
      items: JSON.stringify(orderData.items),
      shipping_address: JSON.stringify(orderData.shipping_address),
      shipping_option: JSON.stringify(orderData.shipping_option)
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([dbOrderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    console.log('Order created successfully:', data);
    const normalized = normalizeOrder(data);
    
    // Send configured order emails (customer + team) using helper
    try {
      await sendOrderConfirmationEmails(normalized);
    } catch (emailError) {
      console.error('Error sending configured order emails:', emailError);
      // don't propagate
    }

    return normalized;
  };

  // Removed empty tracking submission to avoid 400s on server.

  const handleBankTransferCheckout = async () => {
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
      const order = await createOrderInDatabase({
        id: bankDetails.reference,
        user_id: user?.id || 'guest',
        user_name: shippingAddress.name || 'guest',
        email: user?.email || 'guest@example.com', // Add a default email for guest users
        items: items.slice(), // Create a copy of the items array
        total: subtotal + shippingCost,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        payment_method: 'bank-transfer',
        shipping_address: {...shippingAddress}, // Create a copy
        invoice_status: 'draft' as const,
        shipping_option: selectedOption,
        updated_at: new Date().toISOString()
      });

  // Skip creating an empty tracking record; dispatch can add tracking later.
      
      // Clear the cart first to avoid race conditions
      clearCart();
      
      // Show success message
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed. Please complete your bank transfer.",
      });
      
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
