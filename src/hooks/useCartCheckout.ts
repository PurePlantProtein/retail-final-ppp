
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useShipping } from '@/contexts/ShippingContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShippingOption, Order } from '@/types/product';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/emailService';
import { loadEmailSettings } from '@/utils/emailSettings';

export const useCartCheckout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank-transfer' | 'card'>('bank-transfer');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const { shippingAddress } = useShipping();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShippingSubmit = (shippingOption: ShippingOption) => {
    setSelectedShippingOption(shippingOption);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = async () => {
    if (!user || !profile || !shippingAddress || !selectedShippingOption) {
      toast({
        title: "Error",
        description: "Missing required information for checkout",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      // Transform cart items to match database format
      const transformedItems = items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          image: item.product.image,
          category: item.product.category,
          min_quantity: item.product.min_quantity,
          stock: item.product.stock,
          weight: item.product.weight,
          bag_size: item.product.bag_size,
          number_of_servings: item.product.number_of_servings,
          serving_size: item.product.serving_size,
          ingredients: item.product.ingredients,
          amino_acid_profile: item.product.amino_acid_profile,
          nutritional_info: item.product.nutritional_info,
          created_at: item.product.created_at,
          updated_at: item.product.updated_at
        },
        quantity: item.quantity
      }));

      // Create order object
      const orderData = {
        id: orderId,
        user_id: user.id,
        user_name: profile.business_name,
        email: user.email,
        items: transformedItems as any, // Cast to any to satisfy Json type
        total: total + selectedShippingOption.price,
        status: 'pending',
        created_at: now,
        payment_method: paymentMethod,
        shipping_address: shippingAddress as any, // Cast to any to satisfy Json type
        invoice_status: 'draft',
        shipping_option: selectedShippingOption as any, // Cast to any to satisfy Json type
        updated_at: now
      };

      console.log('Creating order with data:', orderData);
      
      // Insert order into database
      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Order created successfully:', insertedOrder);

      // Create order object for email service
      const order: Order = {
        id: orderId,
        userId: user.id,
        userName: profile.business_name,
        email: user.email || '',
        items: items,
        total: total + selectedShippingOption.price,
        status: 'pending',
        createdAt: now,
        paymentMethod: paymentMethod,
        invoiceStatus: 'draft',
        invoiceUrl: '', // Will be set later
        shippingAddress: shippingAddress,
        shippingOption: selectedShippingOption,
        updatedAt: now
      };

      // Send emails based on settings
      const emailSettings = loadEmailSettings();
      
      try {
        if (emailSettings.notifyCustomer) {
          await sendOrderConfirmationEmail(order, user.email || '', 'customer');
        }
        
        if (emailSettings.notifyAdmin && emailSettings.adminEmail) {
          await sendAdminOrderNotification(order, emailSettings.adminEmail);
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't block the order process for email failures
      }

      // Clear cart and redirect
      clearCart();
      navigate('/order-success', { 
        state: { 
          orderId: orderId,
          paymentMethod: paymentMethod,
          total: total + selectedShippingOption.price
        } 
      });

      toast({
        title: "Order placed successfully!",
        description: `Your order ${orderId} has been submitted.`,
      });

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedShippingOption,
    paymentMethod,
    setPaymentMethod,
    isCheckingOut,
    handleShippingSubmit,
    handlePaymentSubmit,
  };
};
