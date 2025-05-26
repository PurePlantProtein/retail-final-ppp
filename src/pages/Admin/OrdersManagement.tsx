
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { EditOrderDialog } from '@/components/admin/orders/EditOrderDialog';
import { DeleteOrderDialog } from '@/components/admin/orders/DeleteOrderDialog';
import { TrackingInfoDialog } from '@/components/admin/orders/TrackingInfoDialog';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types/product';

const OrdersManagement = () => {
  const {
    orders,
    isLoading,
    selectedOrder,
    setSelectedOrder,
    isSubmitting,
    handleStatusChange,
    handleUpdateOrder,
    handleDeleteOrder
  } = useOrders();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingDialog(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Orders Management</h1>
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Orders Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage customer orders and tracking information</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <OrdersTable 
                orders={orders}
                onStatusChange={handleStatusChange}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onAddTracking={openTrackingDialog}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Edit Order Dialog */}
        <EditOrderDialog
          order={selectedOrder}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleUpdateOrder}
          isSubmitting={isSubmitting}
        />
        
        {/* Delete Order Dialog */}
        <DeleteOrderDialog
          order={selectedOrder}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteOrder}
          isSubmitting={isSubmitting}
        />

        {/* Tracking Info Dialog */}
        <TrackingInfoDialog
          order={selectedOrder}
          open={showTrackingDialog}
          onOpenChange={setShowTrackingDialog}
          onSubmit={handleUpdateOrder}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default OrdersManagement;
