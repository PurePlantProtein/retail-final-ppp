
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2 } from 'lucide-react';

interface EmailSettingsFormProps {
  adminEmail: string;
  setAdminEmail: (value: string) => void;
  dispatchEmail: string;
  setDispatchEmail: (value: string) => void;
  accountsEmail: string;
  setAccountsEmail: (value: string) => void;
  notifyAdmin: boolean;
  setNotifyAdmin: (value: boolean) => void;
  notifyDispatch: boolean;
  setNotifyDispatch: (value: boolean) => void;
  notifyAccounts: boolean;
  setNotifyAccounts: (value: boolean) => void;
  notifyCustomer: boolean;
  setNotifyCustomer: (value: boolean) => void;
  isTesting: boolean;
  testStatus: null | 'success' | 'error';
  sendTestEmail: () => Promise<void>;
  handleSaveSettings: () => void;
}

export const EmailSettingsForm: React.FC<EmailSettingsFormProps> = ({
  adminEmail,
  setAdminEmail,
  dispatchEmail,
  setDispatchEmail,
  accountsEmail,
  setAccountsEmail,
  notifyAdmin,
  setNotifyAdmin,
  notifyDispatch,
  setNotifyDispatch,
  notifyAccounts,
  setNotifyAccounts,
  notifyCustomer,
  setNotifyCustomer,
  isTesting,
  testStatus,
  sendTestEmail,
  handleSaveSettings
}) => {
  return (
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
        {/* Sales Email */}
        <div className="space-y-2">
          <Label htmlFor="adminEmail">Sales Email Address</Label>
          <Input
            id="adminEmail"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="sales@example.com"
          />
          <p className="text-sm text-muted-foreground">
            Sales notifications will be sent to this email address
          </p>
        </div>
        
        {/* Dispatch Email */}
        <div className="space-y-2">
          <Label htmlFor="dispatchEmail">Dispatch Email Address</Label>
          <Input
            id="dispatchEmail"
            type="email"
            value={dispatchEmail}
            onChange={(e) => setDispatchEmail(e.target.value)}
            placeholder="dispatch@example.com"
          />
          <p className="text-sm text-muted-foreground">
            Order shipping details will be sent to this email address
          </p>
        </div>
        
        {/* Accounts Email */}
        <div className="space-y-2">
          <Label htmlFor="accountsEmail">Accounts Email Address</Label>
          <Input
            id="accountsEmail"
            type="email"
            value={accountsEmail}
            onChange={(e) => setAccountsEmail(e.target.value)}
            placeholder="accounts@example.com"
          />
          <p className="text-sm text-muted-foreground">
            Order billing information will be sent to this email address
          </p>
        </div>
        
        {/* Notification Toggles */}
        <div className="flex items-center space-x-2 justify-between">
          <div>
            <Label htmlFor="notifyAdmin">Send notifications to sales</Label>
            <p className="text-sm text-muted-foreground">
              Send a notification to sales when new orders are placed
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
            <Label htmlFor="notifyDispatch">Send notifications to dispatch</Label>
            <p className="text-sm text-muted-foreground">
              Send shipping details to dispatch when orders are placed
            </p>
          </div>
          <Switch
            id="notifyDispatch"
            checked={notifyDispatch}
            onCheckedChange={setNotifyDispatch}
          />
        </div>
        
        <div className="flex items-center space-x-2 justify-between">
          <div>
            <Label htmlFor="notifyAccounts">Send notifications to accounts</Label>
            <p className="text-sm text-muted-foreground">
              Send billing information to accounts when orders are placed
            </p>
          </div>
          <Switch
            id="notifyAccounts"
            checked={notifyAccounts}
            onCheckedChange={setNotifyAccounts}
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
  );
};
