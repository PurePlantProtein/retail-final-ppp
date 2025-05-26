
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Truck, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types/product';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders } = useOrders();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Force a refresh of orders when component mounts
    fetchOrders();
  }, [user, navigate, fetchOrders]);

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

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                      <CardTitle className="text-lg mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <Accordion type="single" collapsible defaultValue="items">
                      <AccordionItem value="items">
                        <AccordionTrigger>
                          Order Items ({order.items.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 mt-4">
                            {order.items.map((item, index) => (
                              <div 
                                key={`${order.id}-${item.product.id}-${index}`} 
                                className="flex items-center gap-4 py-3"
                              >
                                <div className="w-16 h-16 flex-shrink-0">
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    ${(item.quantity * item.product.price).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {order.trackingInfo && (
                        <AccordionItem value="tracking">
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Tracking Information
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 py-2">
                              <div className="flex justify-between">
                                <p>Tracking Number:</p>
                                <p className="font-medium">{order.trackingInfo.trackingNumber}</p>
                              </div>
                              <div className="flex justify-between">
                                <p>Carrier:</p>
                                <p className="font-medium">{order.trackingInfo.carrier}</p>
                              </div>
                              {order.trackingInfo.shippedDate && (
                                <div className="flex justify-between">
                                  <p>Shipped Date:</p>
                                  <p className="font-medium">
                                    {new Date(order.trackingInfo.shippedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {order.trackingInfo.estimatedDeliveryDate && (
                                <div className="flex justify-between">
                                  <p>Estimated Delivery:</p>
                                  <p className="font-medium">
                                    {new Date(order.trackingInfo.estimatedDeliveryDate).toLocaleDateString()}
                                  </p>
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
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      
                      <AccordionItem value="payment">
                        <AccordionTrigger>
                          Payment Information
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 py-2">
                            <div className="flex justify-between">
                              <p>Payment Method:</p>
                              <p className="capitalize">{order.paymentMethod.replace('-', ' ')}</p>
                            </div>
                            <div className="flex justify-between">
                              <p>Invoice Status:</p>
                              <p className="capitalize">{order.invoiceStatus || 'pending'}</p>
                            </div>
                            <div className="flex justify-between">
                              <p>Order Total:</p>
                              <p className="font-medium">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {order.shippingAddress && (
                        <AccordionItem value="shipping">
                          <AccordionTrigger>
                            Shipping Details
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-muted p-4 rounded-md">
                              <p className="font-medium">{order.shippingAddress.name}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                              <p>{order.shippingAddress.country}</p>
                              <p>Phone: {order.shippingAddress.phone}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                    
                    <Separator />
                    
                    <div className="flex flex-wrap gap-4">
                      {order.trackingInfo?.trackingUrl ? (
                        <Button variant="outline" asChild>
                          <a 
                            href={order.trackingInfo.trackingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Truck className="h-4 w-4" />
                            Track Order
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Truck className="h-4 w-4 mr-2" />
                          Tracking Pending
                        </Button>
                      )}
                      {order.invoiceUrl ? (
                        <Button variant="outline" asChild>
                          <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">View Invoice</a>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>Invoice Pending</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-16">
              <p className="mb-6 text-gray-500">You don't have any orders yet</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
