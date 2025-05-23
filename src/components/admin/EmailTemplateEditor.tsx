
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit2, Save } from 'lucide-react';

interface EmailTemplateEditorProps {
  customerTemplate: string;
  setCustomerTemplate: (value: string) => void;
  adminTemplate: string;
  setAdminTemplate: (value: string) => void;
  dispatchTemplate: string;
  setDispatchTemplate: (value: string) => void;
  accountsTemplate: string;
  setAccountsTemplate: (value: string) => void;
  editingTemplate: boolean;
  setEditingTemplate: (value: boolean) => void;
  currentTab: string;
  setCurrentTab: (value: string) => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  customerTemplate,
  setCustomerTemplate,
  adminTemplate,
  setAdminTemplate,
  dispatchTemplate,
  setDispatchTemplate,
  accountsTemplate,
  setAccountsTemplate,
  editingTemplate,
  setEditingTemplate,
  currentTab,
  setCurrentTab
}) => {
  return (
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
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="admin">Sales</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
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
                <Label htmlFor="adminTemplate">Sales Notification Template</Label>
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
                <h3 className="font-medium mb-1">Sales Notification Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sent to the sales email address when a new order is received. Includes all order details and customer information.
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

          <TabsContent value="dispatch">
            {editingTemplate ? (
              <div className="space-y-2">
                <Label htmlFor="dispatchTemplate">Dispatch Notification Template</Label>
                <Textarea
                  id="dispatchTemplate"
                  value={dispatchTemplate}
                  onChange={(e) => setDispatchTemplate(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: &#123;&#123;orderId&#125;&#125;, &#123;&#123;userName&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;total&#125;&#125;, &#123;&#123;paymentMethod&#125;&#125;, 
                  &#123;&#123;items&#125;&#125;, &#123;&#123;shippingAddress&#125;&#125; - use &#123;&#123;#each items&#125;&#125; to iterate through items.
                </p>
              </div>
            ) : (
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-1">Dispatch Notification Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sent to the dispatch email address when a new order is received. Includes shipping details and order contents.
                </p>
                <div className="text-xs bg-slate-50 p-3 rounded border max-h-[200px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{dispatchTemplate}</pre>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Sender: <strong>orders@retail.ppprotein.com.au</strong>
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="accounts">
            {editingTemplate ? (
              <div className="space-y-2">
                <Label htmlFor="accountsTemplate">Accounts Notification Template</Label>
                <Textarea
                  id="accountsTemplate"
                  value={accountsTemplate}
                  onChange={(e) => setAccountsTemplate(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: &#123;&#123;orderId&#125;&#125;, &#123;&#123;userName&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;total&#125;&#125;, &#123;&#123;paymentMethod&#125;&#125;, 
                  &#123;&#123;items&#125;&#125; - use &#123;&#123;#each items&#125;&#125; to iterate through items.
                </p>
              </div>
            ) : (
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-1">Accounts Notification Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sent to the accounts email address when a new order is received. Includes order details and billing information.
                </p>
                <div className="text-xs bg-slate-50 p-3 rounded border max-h-[200px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{accountsTemplate}</pre>
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
  );
};
