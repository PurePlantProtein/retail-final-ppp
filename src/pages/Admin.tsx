
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
    }
  }, [user, isAdmin, navigate, toast]);

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/products" className="text-primary hover:underline">
                    Manage Products
                  </Link>
                </li>
                <li>
                  <Link to="/admin/products/import" className="text-primary hover:underline">
                    Import Products
                  </Link>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/products">
                  Manage Products
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* User Management */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
              <CardDescription>
                Manage wholesale accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/users" className="text-primary hover:underline">
                    View Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users/pending" className="text-primary hover:underline">
                    Approval Requests
                  </Link>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/users">
                  Manage Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Orders */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Orders & Analytics
              </CardTitle>
              <CardDescription>
                View orders and sales data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/orders" className="text-primary hover:underline">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/admin/analytics" className="text-primary hover:underline">
                    Sales Analytics
                  </Link>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/orders">
                  View Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Settings */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/settings/general" className="text-primary hover:underline">
                    General Settings
                  </Link>
                </li>
                <li>
                  <Link to="/admin/settings/shipping" className="text-primary hover:underline">
                    Shipping Options
                  </Link>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/settings/general">
                  Manage Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
