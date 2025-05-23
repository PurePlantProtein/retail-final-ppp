
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, CheckCircle2, Edit2, Save } from 'lucide-react';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { mapProductForClient } from '@/utils/productUtils';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailSettings = () => {
  const { emailSettings, updateEmailSettings } = useCart();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState(emailSettings.adminEmail || 'sales@ppprotein.com.au');
  const [notifyAdmin, setNotifyAdmin] = useState(emailSettings.notifyAdmin);
  const [notifyCustomer, setNotifyCustomer] = useState(emailSettings.notifyCustomer);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<null | 'success' | 'error'>(null);
  
  // Email templates state
  const [customerTemplate, setCustomerTemplate] = useState(`
<h1>Order Confirmation</h1>
<p>Thank you for your order!</p>
<p>Order ID: {{orderId}}</p>
<div>
  <h3>Order Details:</h3>
  <ul>
    {{#each items}}
    <li>{{product.name}} - Quantity: {{quantity}} - ${{product.price}}</li>
    {{/each}}
  </ul>
</div>
<p>Total: ${{total}}</p>
<p>Payment Method: {{paymentMethod}}</p>
<p>Thank you for shopping with us!</p>
  `);
  
  const [adminTemplate, setAdminTemplate] = useState(`
<h1>New Order Notification</h1>
<p>A new order has been placed.</p>
<p>Order ID: {{orderId}}</p>
<p>Customer: {{userName}} ({{email}})</p>
<div>
  <h3>Order Details:</h3>
  <ul>
    {{#each items}}
    <li>{{product.name}} - Quantity: {{quantity}} - ${{product.price}}</li>
    {{/each}}
  </ul>
</div>
<p>Total: ${{total}}</p>
<p>Payment Method: {{paymentMethod}}</p>
  `);
  
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [currentTab, setCurrentTab] = useState("customer");

  const handleSaveSettings = () => {
    // Save email notification settings
    updateEmailSettings({
      adminEmail,
      notifyAdmin,
      notifyCustomer,
      customerTemplate,
      adminTemplate
    });

    toast({
      title: "Settings Saved",
      description: "Email notification settings have been updated.",
    });
  };

  const sendTestEmail = async () => {
    try {
      setIsTesting(true);
      setTestStatus(null);
      
      // Create a mock order for testing the email that conforms to Order type
      const mockOrder = {
        id: "ord_123456",
        userId: "user_123",
        userName: "Test User",
        email: "test@example.com", 
        total: 120.00,
        status: "pending" as const,
        items: [
          {
            product: mapProductForClient({
              id: "prod_1",
              name: "Pure Plant Protein",
              description: "Premium plant-based protein powder",
              price: 60.00,
              min_quantity: 1,
              stock: 100,
              category: "Protein",
              image: "https://example.com/image.jpg",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              weight: null,
              bag_size: null,
              number_of_servings: null,
              serving_size: null,
              ingredients: null,
              amino_acid_profile: null,
              nutritional_info: null
            }),
            quantity: 2
          }
        ],
        paymentMethod: "bank_transfer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await sendOrderConfirmationEmail(mockOrder, adminEmail);
      
      if (!result.success) throw new Error(result.message);
      
      setTestStatus('success');
      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${adminEmail}.`,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      setTestStatus('error');
      toast({
        title: "Test Email Failed",
        description: "There was a problem sending the test email.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6 text-left">Email Notification Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> 
                Order Notifications
              </CardTitle>
              <CardDescription>
                Configure email settings for order notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Order notifications will be sent to this email address
                </p>
              </div>
              
              <div className="flex items-center space-x-2 justify-between">
                <div>
                  <Label htmlFor="notifyAdmin">Send notifications to admin</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a notification to the admin when new orders are placed
                  </p>
                </div>
                <Switch
                  id="notifyAdmin"
                  checked={notifyAdmin}
                  onCheckedChange={setNotifyAdmin}
                />
              </div>
              
              <div className="flex items-center space-x-2 justify-between">
                <div>
                  <Label htmlFor="notifyCustomer">Send confirmations to customers</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a confirmation email to customers when they place an order
                  </p>
                </div>
                <Switch
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onCheckedChange={setNotifyCustomer}
                />
              </div>

              <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                <h3 className="font-medium text-amber-800 mb-1">Email Configuration Complete</h3>
                <p className="text-sm text-amber-700">
                  Your email system is configured to send from <strong>orders@retail.ppprotein.com.au</strong>. This domain has been verified with Resend.
                </p>
              </div>

              {testStatus === 'success' && (
                <div className="bg-green-50 text-green-800 p-3 rounded-md flex gap-2 items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Test email sent successfully</p>
                    <p className="text-sm">Check the inbox for {adminEmail}</p>
                  </div>
                </div>
              )}

              {testStatus === 'error' && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md flex gap-2 items-start">
                  <div className="h-5 w-5 text-red-500">!</div>
                  <div>
                    <p className="font-medium">Failed to send test email</p>
                    <p className="text-sm">There was a problem sending the test email. Check your email settings.</p>
                  </div>
                </div>
              )}

            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={sendTestEmail}
                disabled={isTesting || !adminEmail}
              >
                {isTesting ? "Sending..." : "Send Test Email"}
              </Button>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Email Templates</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingTemplate(!editingTemplate)}
                >
                  {editingTemplate ? (
                    <><Save className="mr-2 h-4 w-4" /> Done Editing</>
                  ) : (
                    <><Edit2 className="mr-2 h-4 w-4" /> Edit Templates</>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Customize the email templates used for order notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="customer">Customer Template</TabsTrigger>
                  <TabsTrigger value="admin">Admin Template</TabsTrigger>
                </TabsList>
                
                <TabsContent value="customer">
                  {editingTemplate ? (
                    <div className="space-y-2">
                      <Label htmlFor="customerTemplate">Customer Order Confirmation Template</Label>
                      <Textarea
                        id="customerTemplate"
                        value={customerTemplate}
                        onChange={(e) => setCustomerTemplate(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available variables: &#123;&#123;orderId&#125;&#125;, &#123;&#123;userName&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;total&#125;&#125;, &#123;&#123;paymentMethod&#125;&#125;, 
                        &#123;&#123;items&#125;&#125; - use &#123;&#123;#each items&#125;&#125; to iterate through items.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-1">Order Confirmation Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sent to customers when they place an order. Includes order details, shipping information, and payment status.
                      </p>
                      <div className="text-xs bg-slate-50 p-3 rounded border max-h-[200px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{customerTemplate}</pre>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Sender: <strong>orders@retail.ppprotein.com.au</strong>
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="admin">
                  {editingTemplate ? (
                    <div className="space-y-2">
                      <Label htmlFor="adminTemplate">Admin Notification Template</Label>
                      <Textarea
                        id="adminTemplate"
                        value={adminTemplate}
                        onChange={(e) => setAdminTemplate(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available variables: &#123;&#123;orderId&#125;&#125;, &#123;&#123;userName&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;total&#125;&#125;, &#123;&#123;paymentMethod&#125;&#125;, 
                        &#123;&#123;items&#125;&#125; - use &#123;&#123;#each items&#125;&#125; to iterate through items.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-1">Admin Notification Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sent to the admin email address when a new order is received. Includes all order details and customer information.
                      </p>
                      <div className="text-xs bg-slate-50 p-3 rounded border max-h-[200px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{adminTemplate}</pre>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Sender: <strong>orders@retail.ppprotein.com.au</strong>
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default EmailSettings;
