
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus } from '@/types/product';
import { getOrders, updateOrderStatus, deleteOrder } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // First try to get orders from localStorage
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders) as Order[];
        
        // Filter orders for the current user
        let userOrders = parsedOrders;
        if (user) {
          userOrders = parsedOrders.filter(order => 
            order.userId === user.id || order.email === user.email
          );
        }
        
        console.log('Fetched orders from localStorage:', userOrders);
        setOrders(userOrders);
      } else {
        // Fallback to mock data service
        const data = await getOrders();
        console.log('Fetched orders from mock service:', data);
        setOrders(data);
      }
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
      
      // Update the order in localStorage too
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders) as Order[];
        const updatedOrders = parsedOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
      
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
      
      // Update the order in local state
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      
      // Update the order in localStorage too
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders) as Order[];
        const updatedOrders = parsedOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
      
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
      
      // Remove from local state
      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));
      
      // Remove from localStorage too
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders) as Order[];
        const updatedOrders = parsedOrders.filter(order => order.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
      
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
