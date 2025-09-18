import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Package } from 'lucide-react';
import { BulkEmailScheduler } from '@/components/admin/BulkEmailScheduler';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const BulkOrderEmails = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [subject, setSubject] = useState('New Products Available for Order');
  const [message, setMessage] = useState('Ready to reorder? We keep ordering super simple so you can focus on your customers.');
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
    
    fetchProducts();
  }, [user, isAdmin, navigate, toast]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    }
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const sendBulkEmail = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to include in the email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
      
      const { data, error } = await supabase.functions.invoke('send-bulk-order-email', {
        body: {
          type: 'send_bulk',
          subject,
          message,
          products: selectedProductData,
          scheduleRecurring: isScheduleEnabled
        }
      });

      if (error) throw error;

      toast({
        title: "Emails Sent Successfully",
        description: `Bulk order emails sent to ${data.sent} retailers.${isScheduleEnabled ? ' Auto-schedule is now active.' : ''}`,
      });

      // Reset form
      setSelectedProducts([]);
      setSubject('New Products Available for Order');
      setMessage('We have exciting new products available for order. Please review the items below and submit your quantities directly through this email.');

    } catch (error: any) {
      console.error('Failed to send bulk emails:', error);
      toast({
        title: "Failed to Send Emails",
        description: error.message || "Something went wrong while sending emails.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <AdminLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-left">Bulk Order Emails</h1>
              <p className="text-muted-foreground text-left mt-2">
                Send order forms directly to all active retailers via email
              </p>
            </div>
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <div className="grid gap-6">
            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure the subject and message for your bulk order email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject Line</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message to retailers..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auto-Schedule */}
            <BulkEmailScheduler onScheduleChange={setIsScheduleEnabled} />

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Products</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Choose which products to include in the order form ({selectedProducts.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                      />
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      {!product.image && (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatCurrency(product.price as any)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Send Email */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Ready to Send</h3>
                    <p className="text-sm text-muted-foreground">
                      This will send the order form to all approved retailers
                      {isScheduleEnabled && " and enable 30-day auto-scheduling"}
                    </p>
                  </div>
                  <Button
                    onClick={sendBulkEmail}
                    disabled={isLoading || selectedProducts.length === 0}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {isScheduleEnabled ? 'Send & Schedule' : 'Send to All Retailers'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default BulkOrderEmails;
