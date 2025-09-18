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
      if (error) throw error;

      // 1) Pre-enrich items with product details when only product_id is present
      let productMap: Record<string, any> = {};
      try {
        const needed = new Set<string>();
        for (const ro of rawOrders || []) {
          const items = typeof ro.items === 'string' ? JSON.parse(ro.items) : (ro.items || []);
          for (const it of Array.isArray(items) ? items : []) {
            const pid = it?.product?.id || it?.product_id;
            if (!it?.product && pid) needed.add(String(pid));
          }
        }
        if (needed.size) {
          const ids = Array.from(needed);
          const { data: prods } = await supabase.from('products').select('*').in('id', ids);
          for (const p of prods || []) productMap[String(p.id)] = p;
        }
      } catch (e) {
        console.warn('orders enrichment failed', e);
      }

      // Build a map of tracking info for these orders
      let trackingMap: Record<string, TrackingInfo> = {};
      if (rawOrders && rawOrders.length) {
        try {
          const orderIds = rawOrders.map(o => o.id).filter(Boolean);
          if (orderIds.length) {
            const { data: trackingRows, error: trackingErr } = await supabase
              .from('tracking_info')
              .select('*')
              .in('order_id', orderIds);
            if (!trackingErr && trackingRows) {
              trackingRows.forEach((r: any) => {
                if (!r) return;
                trackingMap[r.order_id] = {
                  trackingNumber: r.tracking_number || '',
                  carrier: r.carrier || '',
                  trackingUrl: r.tracking_url || undefined,
                  shippedDate: r.shipped_date ? String(r.shipped_date).split('T')[0] : undefined,
                  estimatedDeliveryDate: r.estimated_delivery_date ? String(r.estimated_delivery_date).split('T')[0] : undefined,
                };
              });
            }
          }
        } catch (tErr) {
          console.warn('Unable to merge tracking info', tErr);
        }
      }

      const fetchedOrders = rawOrders?.map(o => {
        // Enrich each order's items before normalization, so normalizeOrder can map product correctly
        try {
          const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
          const enriched = (Array.isArray(items) ? items : []).map((it: any) => {
            if (!it.product && (it.product_id || it.id)) {
              const pid = String(it.product_id || it.id);
              const p = productMap[pid];
              if (p) return { ...it, product: p };
            }
            return it;
          });
          o = { ...o, items: JSON.stringify(enriched) } as any;
        } catch {}

        const base = normalizeOrder(o as any);
        const ti = trackingMap[base.id];
        return ti ? { ...base, trackingInfo: ti } : base;
      });

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

      const res = await fetch(`/api/admin/orders/${encodeURIComponent(updatedOrder.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          user_name: updatedOrder.userName,
          email: updatedOrder.email,
          status: updatedOrder.status,
          payment_method: updatedOrder.paymentMethod,
          invoice_status: updatedOrder.invoiceStatus,
          invoice_url: updatedOrder.invoiceUrl,
          notes: updatedOrder.notes,
          items: updatedOrder.items,
          shipping_address: updatedOrder.shippingAddress,
          shipping_option: updatedOrder.shippingOption,
          total: updatedOrder.total
        })
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || 'failed');

      // Normalize server response
      const normalized = normalizeOrder(body.data);
      setOrders(current => current.map(order => order.id === normalized.id ? { ...normalized } : order));

      toast({
        title: "Order Updated",
        description: `Order #${updatedOrder.id} has been updated successfully${body.email_sent ? ' and notifications were sent.' : '.'}`,
      });
      return true;
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "There was a problem updating the order.",
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

  const handleTrackingSubmit = async (orderId: string, trackingInfo: TrackingInfo): Promise<{success:boolean; emailSent:boolean}> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          tracking_number: trackingInfo.trackingNumber,
          carrier: trackingInfo.carrier,
          tracking_url: trackingInfo.trackingUrl,
          shipped_date: trackingInfo.shippedDate,
          estimated_delivery_date: trackingInfo.estimatedDeliveryDate
        })
      });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(body.error || 'failed');
      // Use server-returned tracking row (snake_case) to ensure we capture derived URL
      const row = body.data || {};
      const normalized: TrackingInfo = {
        trackingNumber: row.tracking_number || trackingInfo.trackingNumber,
        carrier: row.carrier || trackingInfo.carrier,
        trackingUrl: row.tracking_url || trackingInfo.trackingUrl,
        shippedDate: row.shipped_date ? String(row.shipped_date).split('T')[0] : trackingInfo.shippedDate,
        estimatedDeliveryDate: row.estimated_delivery_date ? String(row.estimated_delivery_date).split('T')[0] : trackingInfo.estimatedDeliveryDate,
      };
      // Update local state
      setOrders(current => current.map(o => o.id === orderId ? { ...o, trackingInfo: normalized, status: o.status === 'shipped' ? o.status : 'shipped' } : o));
      toast({ title: 'Tracking Info Saved', description: `Tracking info for order #${orderId} saved.` });
      return { success: true, emailSent: !!body.email_sent };
    } catch (e:any) {
      console.error('tracking endpoint error', e);
      toast({ variant: 'destructive', title: 'Tracking Save Failed', description: e.message || 'Unable to save tracking info.' });
      return { success: false, emailSent: false };
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

  // Admin create order with manual line pricing and shipping
  const createAdminOrder = async (payload: {
    user: { id?: string; email?: string };
    items: Array<{ product_id: string; quantity: number; unit_price?: number }>;
    shipping_price?: number;
    shipping_address?: any;
    shipping_option?: any;
    notes?: string;
    payment_method?: string;
    status?: OrderStatus;
  }): Promise<Order | null> => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || 'Failed to create order');
      const newOrder = normalizeOrder(body.data);
      setOrders(curr => [newOrder, ...curr]);
      toast({ title: 'Order Created', description: `Order ${newOrder.id} created.` });
      return newOrder;
    } catch (e: any) {
      console.error('createAdminOrder error', e);
      toast({ variant: 'destructive', title: 'Create Failed', description: e.message || 'Unable to create order.' });
      return null;
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
    handleStatusChange,
    handleUpdateOrder,
    handleDeleteOrder,
    getOrderById,
    fetchTrackingInfo,
    handleTrackingSubmit,
    clearAllOrders,
  updateOrder,
  createAdminOrder
  };
};
