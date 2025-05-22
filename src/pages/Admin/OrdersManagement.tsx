
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { getOrders, updateOrderStatus, getOrderById } from '@/services/mockData';
import { Order, OrderStatus } from '@/types/product';
import { Eye } from 'lucide-react';

const OrdersManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  
  // New state for order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAdmin, navigate]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // New function to view order details
  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const order = await getOrderById(orderId);
      if (order) {
        setSelectedOrder(order);
        setIsOrderDetailsOpen(true);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrderDetails(order.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Select
                                defaultValue={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => paginate(Math.max(currentPage - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        // Only show a few pages to avoid clutter
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink 
                                isActive={pageNumber === currentPage}
                                onClick={() => paginate(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <p>No orders found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id} • {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium">Customer Information</h3>
                <p className="text-sm text-gray-500">{selectedOrder.userName}</p>
              </div>

              <Separator />

              {/* Order Status */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Status</h3>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={`${selectedOrder.id}-${item.product.id}-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-500">#{item.product.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        ${selectedOrder.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* Shipping Address (if available) */}
              {selectedOrder.shippingAddress && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Payment Information */}
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-500">Payment Method:</p>
                  <p className="capitalize">{selectedOrder.paymentMethod.replace('-', ' ')}</p>
                  
                  <p className="text-gray-500">Payment Status:</p>
                  <p className="capitalize">{selectedOrder.invoiceStatus || 'pending'}</p>
                  
                  {selectedOrder.invoiceNumber && (
                    <>
                      <p className="text-gray-500">Invoice Number:</p>
                      <p>{selectedOrder.invoiceNumber}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Notes (if available) */}
              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsOrderDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrdersManagement;
