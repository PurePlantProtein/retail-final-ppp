
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, BarChart, LineChart, PieChart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AnalyticsManagement = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
  }, [user, isAdmin, navigate, toast]);

  const handlePlaceholderClick = (featureName: string) => {
    toast({
      title: "Coming Soon",
      description: `The ${featureName} feature will be available in a future update.`,
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Analytics and reporting features are coming soon. You'll be able to view sales data, customer insights, and performance metrics.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Sales Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-muted/30 rounded-md flex items-center justify-center mb-4">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
              </div>
              <Button onClick={() => handlePlaceholderClick('Sales Analytics')} className="w-full">
                View Sales Data
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-muted/30 rounded-md flex items-center justify-center mb-4">
                <LineChart className="h-10 w-10 text-muted-foreground" />
              </div>
              <Button onClick={() => handlePlaceholderClick('Growth Trends')} className="w-full">
                View Trends
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-muted/30 rounded-md flex items-center justify-center mb-4">
                <PieChart className="h-10 w-10 text-muted-foreground" />
              </div>
              <Button onClick={() => handlePlaceholderClick('Category Distribution')} className="w-full">
                View Category Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsManagement;
