
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus } from '@/types/product';
import { getOrders, updateOrderStatus, deleteOrder } from '@/services/mockData';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      await updateOrderStatus(orderId, newStatus);
      setOrders(currentOrders => 
        currentOrders.map(order => 
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
      
      // Here you would call your API to update the order
      // For now, let's just update the local state
      setOrders(currentOrders => 
        currentOrders.map(order => 
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
      await deleteOrder(orderId);
      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));
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

  return {
    orders,
    isLoading,
    selectedOrder,
    setSelectedOrder,
    isSubmitting,
    fetchOrders,
    handleStatusChange,
    handleUpdateOrder,
    handleDeleteOrder
  };
};
