
import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { mapProductForClient } from '@/utils/productUtils';
import { EmailSettingsForm } from '@/components/admin/EmailSettingsForm';
// Template editing disabled; templates are now managed on the backend
// import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { defaultDispatchTemplate, defaultAccountsTemplate } from '@/utils/emailUtils';

const EmailSettings = () => {
  const { emailSettings, updateEmailSettings } = useCart();
  const { toast } = useToast();
  
  // Email addresses state
  const [adminEmail, setAdminEmail] = useState(emailSettings.adminEmail || 'sales@ppprotein.com.au');
  const [dispatchEmail, setDispatchEmail] = useState(emailSettings.dispatchEmail || '');
  const [accountsEmail, setAccountsEmail] = useState(emailSettings.accountsEmail || '');
  
  // Notification settings
  const [notifyAdmin, setNotifyAdmin] = useState(emailSettings.notifyAdmin);
  const [notifyDispatch, setNotifyDispatch] = useState(emailSettings.notifyDispatch || false);
  const [notifyAccounts, setNotifyAccounts] = useState(emailSettings.notifyAccounts || false);
  const [notifyCustomer, setNotifyCustomer] = useState(emailSettings.notifyCustomer);
  
  // Test email state
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<null | 'success' | 'error'>(null);
  
  // Email templates state
  const [customerTemplate, setCustomerTemplate] = useState(emailSettings.customerTemplate || `
<h1>Order Confirmation</h1>
<p>Thank you for your order!</p>
<p>Order ID: \{\{orderId\}\}</p>
<div>
  <h3>Order Details:</h3>
  <ul>
    \{\{#each items\}\}
    <li>\{\{product.name\}\} - Quantity: \{\{quantity\}\} - $\{\{product.price\}\}</li>
    \{\{/each\}\}
  </ul>
</div>
<p>Total: $\{\{total\}\}</p>
<p>Payment Method: \{\{paymentMethod\}\}</p>
<p>Thank you for shopping with us!</p>
  `);
  
  const [adminTemplate, setAdminTemplate] = useState(emailSettings.adminTemplate || `
<h1>New Order Notification</h1>
<p>A new order has been placed.</p>
<p>Order ID: \{\{orderId\}\}</p>
<p>Customer: \{\{userName\}\} (\{\{email\}\})</p>
<div>
  <h3>Order Details:</h3>
  <ul>
    \{\{#each items\}\}
    <li>\{\{product.name\}\} - Quantity: \{\{quantity\}\} - $\{\{product.price\}\}</li>
    \{\{/each\}\}
  </ul>
</div>
<p>Total: $\{\{total\}\}</p>
<p>Payment Method: \{\{paymentMethod\}\}</p>
  `);
  
  const [dispatchTemplate, setDispatchTemplate] = useState(emailSettings.dispatchTemplate || defaultDispatchTemplate);
  const [accountsTemplate, setAccountsTemplate] = useState(emailSettings.accountsTemplate || defaultAccountsTemplate);
  const [trackingTemplate, setTrackingTemplate] = useState(emailSettings.trackingTemplate || `<p style="margin:0 0 12px;font-size:15px;">Your order <strong>{{orderId}}</strong> is now in transit via <strong>{{carrier}}</strong>.</p>\n<p style=\"margin:0 0 12px;font-size:14px;\">Tracking Number: <strong>{{trackingNumber}}</strong></p>\n<p style=\"margin:0 0 12px;font-size:14px;\">Track here: <a href=\"{{trackingLink}}\" style=\"color:#2563eb;\">{{trackingLink}}</a></p>\n<p style=\"margin:0;font-size:13px;color:#6b7280;\">Thank you for choosing {{brand}}.</p>`);
  
  // Template editing state
  // const [editingTemplate, setEditingTemplate] = useState(false);
  const [currentTab, setCurrentTab] = useState("customer");

  // Load persisted settings from backend (single row) on mount
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // must be authed
        const res = await fetch('/api/email-settings', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        const body = await res.json();
        const data = body?.data;
        if (data) {
          setAdminEmail(data.admin_email || '');
          setDispatchEmail(data.dispatch_email || '');
          setAccountsEmail(data.accounts_email || '');
          setNotifyAdmin(!!data.notify_admin);
          setNotifyDispatch(!!data.notify_dispatch);
            setNotifyAccounts(!!data.notify_accounts);
          setNotifyCustomer(!!data.notify_customer);
          if (data.tracking_template) setTrackingTemplate(data.tracking_template);
          // still keep templates from local settings for now
        }
      } catch (e) {
        console.warn('failed to load email-settings from api', e);
      }
    })();
  }, []);

  const handleSaveSettings = async () => {
    // Update local state & localStorage immediately for responsiveness
    updateEmailSettings({
      adminEmail,
      dispatchEmail,
      accountsEmail,
      notifyAdmin,
      notifyDispatch,
      notifyAccounts,
      notifyCustomer,
      customerTemplate,
      adminTemplate,
      dispatchTemplate,
  accountsTemplate,
  trackingTemplate
    });

    // Persist to backend table (creates a new row each save)
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          admin_email: adminEmail || null,
          dispatch_email: dispatchEmail || null,
          accounts_email: accountsEmail || null,
          notify_admin: notifyAdmin,
          notify_dispatch: notifyDispatch,
          notify_accounts: notifyAccounts,
          notify_customer: notifyCustomer,
          customer_template: customerTemplate || null,
          admin_template: adminTemplate || null,
          dispatch_template: dispatchTemplate || null,
          accounts_template: accountsTemplate || null,
          tracking_template: trackingTemplate || null
        })
      });
      if (!res.ok) throw new Error('Save failed');
      toast({
        title: 'Settings Saved',
        description: 'Email notification settings have been updated and persisted.'
      });
    } catch (e:any) {
      console.error('save email-settings failed', e);
      toast({ title: 'Save Failed', description: e.message || 'Unable to persist settings', variant: 'destructive' });
    }
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
        shippingAddress: {
          name: "Test User",
          street: "123 Test Street",
          city: "Sydney",
          state: "NSW",
          postalCode: "2000",
          country: "Australia",
          phone: "0400123456"
        },
        notes: "Please leave at the front door",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Determine which email to send test to based on current tab
      let emailToUse = adminEmail;
      let emailType = 'admin';
      
      switch (currentTab) {
        case 'customer':
          emailToUse = mockOrder.email;
          emailType = 'customer';
          break;
        case 'dispatch':
          emailToUse = dispatchEmail || adminEmail;
          emailType = 'dispatch';
          break;
        case 'accounts':
          emailToUse = accountsEmail || adminEmail;
          emailType = 'accounts';
          break;
        default:
          emailToUse = adminEmail;
          emailType = 'admin';
      }
      
      const result = await sendOrderConfirmationEmail(mockOrder, emailToUse, emailType as any);
      
      if (!result.success) throw new Error(result.message);
      
      setTestStatus('success');
      toast({
        title: "Test Email Sent",
        description: `A test ${emailType} email has been sent to ${emailToUse}.`,
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
          
          <EmailSettingsForm
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            dispatchEmail={dispatchEmail}
            setDispatchEmail={setDispatchEmail}
            accountsEmail={accountsEmail}
            setAccountsEmail={setAccountsEmail}
            notifyAdmin={notifyAdmin}
            setNotifyAdmin={setNotifyAdmin}
            notifyDispatch={notifyDispatch}
            setNotifyDispatch={setNotifyDispatch}
            notifyAccounts={notifyAccounts}
            setNotifyAccounts={setNotifyAccounts}
            notifyCustomer={notifyCustomer}
            setNotifyCustomer={setNotifyCustomer}
            isTesting={isTesting}
            testStatus={testStatus}
            sendTestEmail={sendTestEmail}
            handleSaveSettings={handleSaveSettings}
          />

          {/* Template editor disabled; templates are defined server-side for consistency */}
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default EmailSettings;
