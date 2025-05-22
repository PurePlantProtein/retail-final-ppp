
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

const EmailSettings = () => {
  const { emailSettings, updateEmailSettings } = useCart();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState(emailSettings.adminEmail);
  const [notifyAdmin, setNotifyAdmin] = useState(emailSettings.notifyAdmin);
  const [notifyCustomer, setNotifyCustomer] = useState(emailSettings.notifyCustomer);

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

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Email Notification Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Notifications</CardTitle>
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
                <Label htmlFor="notifyAdmin">Send notifications to admin</Label>
                <Switch
                  id="notifyAdmin"
                  checked={notifyAdmin}
                  onCheckedChange={setNotifyAdmin}
                />
              </div>
              
              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="notifyCustomer">Send confirmations to customers</Label>
                <Switch
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onCheckedChange={setNotifyCustomer}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Note: For this demo, emails are logged to the console. Connect to a real email service like Resend.com via Supabase Edge Functions to send actual emails.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default EmailSettings;
