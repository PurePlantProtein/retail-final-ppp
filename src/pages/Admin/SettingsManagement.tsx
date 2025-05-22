
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Truck } from 'lucide-react';

const SettingsManagement = () => {
  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general store settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configure store name, currency, and other basic settings.</p>
              </CardContent>
              <CardFooter>
                <Button>Manage General Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email notifications for orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Set up order notification emails for administrators and customers.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/admin/email-settings">
                    <Mail className="mr-2 h-4 w-4" /> Manage Email Settings
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment gateways and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Set up payment methods and processors for your store.</p>
              </CardContent>
              <CardFooter>
                <Button>Manage Payment Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
                <CardDescription>
                  Configure shipping options and rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Set up shipping zones, methods, and free shipping rules.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/admin/shipping-settings">
                    <Truck className="mr-2 h-4 w-4" /> Manage Shipping Settings
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default SettingsManagement;
