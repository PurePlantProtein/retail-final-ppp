
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
import { Mail, CheckCircle2 } from 'lucide-react';
import { sendOrderConfirmationEmail } from '@/services/emailService';

const EmailSettings = () => {
  const { emailSettings, updateEmailSettings } = useCart();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState(emailSettings.adminEmail || 'sales@ppprotein.com.au');
  const [notifyAdmin, setNotifyAdmin] = useState(emailSettings.notifyAdmin);
  const [notifyCustomer, setNotifyCustomer] = useState(emailSettings.notifyCustomer);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<null | 'success' | 'error'>(null);

  const handleSaveSettings = () => {
    updateEmailSettings({
      adminEmail,
      notifyAdmin,
      notifyCustomer
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
      
      // Create a mock order for testing the email
      const mockOrder = {
        id: `TEST-${Date.now().toString().slice(-6)}`,
        userId: 'test-user-id',
        userName: 'Test User',
        total: 99.95,
        status: 'pending',
        items: [
          {
            product: {
              name: 'Test Product',
              price: 89.95,
              id: 'test-1',
              description: 'Test product description',
              image: '',
            },
            quantity: 1,
          }
        ],
        shippingAddress: {
          name: 'Test User',
          street: '123 Test Street',
          city: 'Test City',
          state: 'VIC',
          postalCode: '3000',
          country: 'Australia',
          phone: '0400 000 000'
        },
        shippingOption: {
          name: 'Standard Shipping',
          price: 10.00,
          id: 'standard',
          carrier: 'australia-post',
          estimatedDeliveryDays: '3-5 business days',
          description: 'Standard Australia Post shipping'
        },
        paymentMethod: 'bank-transfer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: new Date().toISOString()
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
          <h1 className="text-2xl font-bold mb-6">Email Notification Settings</h1>
          
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
            <CardContent className="space-y-6">
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
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Information about the email templates used for order notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-1">Order Confirmation Email</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sent to customers when they place an order. Includes order details, shipping information, and payment status.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sender: <strong>orders@retail.ppprotein.com.au</strong>
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-1">Admin Notification Email</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sent to the admin email address when a new order is received. Includes all order details and customer information.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sender: <strong>orders@retail.ppprotein.com.au</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default EmailSettings;
