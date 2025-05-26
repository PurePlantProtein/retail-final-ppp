
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardCheck, 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle,
  Edit,
  ExternalLink
} from 'lucide-react';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TrackingInfoDialog } from '@/components/admin/orders/TrackingInfoDialog';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { useToast } from '@/components/ui/use-toast';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, handleStatusChange, handleUpdateOrder, isLoading: isLoadingOrders } = useOrders();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadOrder = () => {
      if (orderId) {
        const foundOrder = getOrderById(orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast({
            variant: "destructive",
            title: "Order Not Found",
            description: "The requested order could not be found."
          });
          navigate('/admin/orders');
        }
      }
      setIsLoading(false);
    };

    if (!isLoadingOrders) {
      loadOrder();
    }
  }, [orderId, getOrderById, isLoadingOrders, navigate, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClipboardCheck className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleChangeStatus = (status: string) => {
    if (order && orderId) {
      handleStatusChange(orderId, status as Order['status']);
      setOrder({
        ...order,
        status: status as Order['status']
      });
    }
  };

  const handleTrackingUpdate = async (updatedOrder: Order) => {
    const success = await handleUpdateOrder(updatedOrder);
    if (success) {
      setOrder(updatedOrder);
    }
    return success;
  };

  if (isLoading || isLoadingOrders) {
    return (
      <Layout>
        <AdminLayout>
          <div className="container mx-auto py-8">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin/orders')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-1/4 bg-muted mx-auto rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <AdminLayout>
          <div className="container mx-auto py-8">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin/orders')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="mb-6">The requested order could not be found.</p>
              <Button onClick={() => navigate('/admin/orders')}>
                Return to Orders
              </Button>
            </div>
          </div>
        </AdminLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin/orders')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowTrackingDialog(true)}
              >
                <Truck className="mr-2 h-4 w-4" />
                {order.trackingInfo ? 'Update Tracking' : 'Add Tracking'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3 space-y-6">
              {/* Order Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Select
                      value={order.status}
                      onValueChange={handleChangeStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <div className="flex items-center">
                            {getStatusIcon(order.status)}
                            <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </SelectValue>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Customer Information</h3>
                      <p>Name: {order.userName}</p>
                      <p>Email: {order.email}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium">Payment Information</h3>
                      <p>Method: {order.paymentMethod}</p>
                      <p>Status: {order.invoiceStatus || "Pending"}</p>
                    </div>
                    
                    {order.notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-medium">Order Notes</h3>
                          <p>{order.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Information */}
              {order.trackingInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Tracking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Tracking Number:</span>
                        <span>{order.trackingInfo.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Carrier:</span>
                        <span>{order.trackingInfo.carrier}</span>
                      </div>
                      {order.trackingInfo.shippedDate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Shipped Date:</span>
                          <span>{formatDate(order.trackingInfo.shippedDate)}</span>
                        </div>
                      )}
                      {order.trackingInfo.estimatedDeliveryDate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Estimated Delivery:</span>
                          <span>{formatDate(order.trackingInfo.estimatedDeliveryDate)}</span>
                        </div>
                      )}
                      {order.trackingInfo.trackingUrl && (
                        <div className="pt-2">
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={order.trackingInfo.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Track Package
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div 
                        key={`${item.product.id}-${index}`} 
                        className="flex items-center gap-4 border-b pb-4 last:border-0"
                      >
                        <div className="w-16 h-16 flex-shrink-0">
                          <img 
                            src={item.product.image || '/placeholder.svg'} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.product.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Subtotal: {formatCurrency(item.quantity * item.product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:w-1/3 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.total - (order.shippingOption?.price || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(order.shippingOption?.price || 0)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Shipping Information */}
              {order.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                    
                    {order.shippingOption && (
                      <div className="mt-4">
                        <p className="font-medium">Shipping Method:</p>
                        <p>{order.shippingOption.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingOption.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Tracking Info Dialog */}
          <TrackingInfoDialog
            order={order}
            open={showTrackingDialog}
            onOpenChange={setShowTrackingDialog}
            onSubmit={handleTrackingUpdate}
            isSubmitting={false}
          />
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default OrderDetail;
