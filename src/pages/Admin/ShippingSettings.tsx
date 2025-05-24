
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Truck, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ShippingSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    freeShippingThreshold: 12,
    freeShippingMessage: 'Free shipping for orders with 12+ items',
    freeShippingDays: '5-7 business days',
  });
  
  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem('shippingSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'freeShippingThreshold' ? parseInt(value, 10) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('shippingSettings', JSON.stringify(settings));
    
    toast({
      title: "Settings saved",
      description: "Shipping settings have been updated successfully.",
    });
  };
  
  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Shipping Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Free Shipping Configuration
              </CardTitle>
              <CardDescription>
                Configure when free shipping is applied and how it's displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">
                      Free Shipping Threshold (Total number of items in order)
                    </Label>
                    <Input
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      type="number"
                      min="1"
                      value={settings.freeShippingThreshold}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingMessage">
                      Free Shipping Message
                    </Label>
                    <Input
                      id="freeShippingMessage"
                      name="freeShippingMessage"
                      value={settings.freeShippingMessage}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingDays">
                      Free Shipping Delivery Time
                    </Label>
                    <Input
                      id="freeShippingDays"
                      name="freeShippingDays"
                      value={settings.freeShippingDays}
                      onChange={handleInputChange}
                      placeholder="e.g. 5-7 business days"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default ShippingSettings;
