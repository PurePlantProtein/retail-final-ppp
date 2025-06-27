
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Order, TrackingInfo } from '@/types/product';
import { transformDatabaseOrder } from '@/utils/orderUtils';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin, only show user's orders
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      const transformedOrders = data?.map(transformDatabaseOrder) || [];
      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error loading orders",
        description: error.message || "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating order",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      // Transform the order data to match database format
      const dbOrderData = {
        id: updatedOrder.id,
        user_id: updatedOrder.userId,
        user_name: updatedOrder.userName,
        email: updatedOrder.email,
        items: updatedOrder.items as any, // Cast to Json type
        total: updatedOrder.total,
        status: updatedOrder.status,
        payment_method: updatedOrder.paymentMethod,
        shipping_address: updatedOrder.shippingAddress as any, // Cast to Json type
        invoice_status: updatedOrder.invoiceStatus,
        invoice_url: updatedOrder.invoiceUrl,
        shipping_option: updatedOrder.shippingOption as any, // Cast to Json type
        notes: updatedOrder.notes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .update(dbOrderData)
        .eq('id', updatedOrder.id);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));

      toast({
        title: "Order updated",
        description: "Order has been successfully updated",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error updating order",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTrackingInfo = async (orderId: string, trackingInfo: TrackingInfo) => {
    try {
      // First, insert tracking info
      const { error: trackingError } = await supabase
        .from('tracking_info')
        .insert({
          order_id: orderId,
          tracking_number: trackingInfo.trackingNumber,
          carrier: trackingInfo.carrier,
          tracking_url: trackingInfo.trackingUrl,
          shipped_date: trackingInfo.shippedDate,
          estimated_delivery_date: trackingInfo.estimatedDeliveryDate
        });

      if (trackingError) throw trackingError;

      // Then update order status to shipped
      const success = await updateOrderStatus(orderId, 'shipped');
      
      if (success) {
        toast({
          title: "Tracking added",
          description: "Tracking information has been added and order marked as shipped",
        });
      }

      return success;
    } catch (error: any) {
      console.error('Error adding tracking info:', error);
      toast({
        title: "Error adding tracking",
        description: error.message || "Failed to add tracking information",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  return {
    orders,
    isLoading,
    fetchOrders,
    updateOrderStatus,
    updateOrder,
    addTrackingInfo,
  };
};
