import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus, TrackingInfo } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { normalizeOrder } from '@/utils/orderUtils';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      const { data: rawOrders, error } = await supabase.from("orders").select("*");
      const fetchedOrders = rawOrders?.map(normalizeOrder);

      if (error) throw error;

      setOrders(fetchedOrders || []);
    } catch (error) {
      console.error("Error fetching orders from Supabase:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(current =>
        current.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Status Updated",
        description: `Order #${orderId} status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the order status.",
      });
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("orders")
        .update(updatedOrder)
        .eq("id", updatedOrder.id);

      if (error) throw error;

      setOrders(current =>
        current.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );

      toast({
        title: "Order Updated",
        description: `Order #${updatedOrder.id} has been updated successfully.`,
      });
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the order.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) throw error;

      setOrders(current => current.filter(order => order.id !== orderId));

      toast({
        title: "Order Deleted",
        description: `Order #${orderId} has been deleted.`,
      });
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was a problem deleting the order.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    const cachedOrder = orders.find(order => order.id === orderId);
    if (cachedOrder) {
      return cachedOrder;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        console.error("Order fetch error:", error);
        return null;
      }

      return normalizeOrder(data);
    } catch (err) {
      console.error("Unexpected error fetching order:", err);
      return null;
    }
  };

  const clearAllOrders = async () => {
    setOrders([]);
    toast({
      title: "Orders Cleared",
      description: "All orders have been cleared from local state.",
    });
  };

  const fetchTrackingInfo = async (orderId: string) => {
    console.log("Fetching tracking info for order:", orderId);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("tracking_info")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return existing;
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      toast({
        variant: "destructive",
        title: "Tracking Fetch Failed",
        description: "Unable to fetch tracking info. Please try again.",
      });
      return null;
    }
  }

  const handleTrackingSubmit = async (orderId: string, trackingInfo: TrackingInfo) => {
    try {
      // Check if tracking info exists for this order
      const existing = await fetchTrackingInfo(orderId);

      const payload = {
        tracking_number: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier,
        tracking_url: trackingInfo.trackingUrl,
        shipped_date: trackingInfo.shippedDate,
        estimated_delivery_date: trackingInfo.estimatedDeliveryDate,
        updated_at: new Date().toISOString()
      };

      console.log("Saving tracking info:", payload);

      // Insert or update the tracking info
      const { error } = existing
        ? await supabase.from("tracking_info").update({
            ...payload,
            updated_at: new Date().toISOString(),
          }).eq("order_id", orderId)
        : await supabase.from("tracking_info").insert({
            ...payload,
            order_id: orderId,
          });

      if (error) throw error;

      toast({
        title: "Tracking Info Saved",
        description: `Tracking info for order #${orderId} was successfully saved.`,
      });

      // Optionally update local order state
      setOrders(current =>
        current.map(order =>
          order.id === orderId ? { ...order, trackingInfo } : order
        )
      );

      // Auto-update the order status to shipped
      await supabase
        .from("orders")
        .update({ status: 'shipped', updated_at: new Date().toISOString() })
        .eq("id", orderId);

      return true;
    } catch (error: any) {
      console.error("Error saving tracking info:", error.message || error);
      toast({
        variant: "destructive",
        title: "Tracking Save Failed",
        description: error.message || "Unable to save tracking info. Please try again.",
      });
      return false;
    }
  };

  const updateOrder = async (order: Order): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: order.status,
        invoice_status: order.invoiceStatus,
        invoice_url: order.invoiceUrl,
        notes: order.notes,
        items: JSON.stringify(order.items),
        shipping_address: JSON.stringify(order.shippingAddress),
        shipping_option: order.shippingOption ? JSON.stringify(order.shippingOption) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return normalizeOrder(data);
  };

  return {
    orders,
    isLoading,
    selectedOrder,
    setSelectedOrder,
    isSubmitting,
    handleStatusChange,
    handleUpdateOrder,
    handleDeleteOrder,
    getOrderById,
    fetchTrackingInfo,
    handleTrackingSubmit,
    clearAllOrders,
    updateOrder
  };
};
