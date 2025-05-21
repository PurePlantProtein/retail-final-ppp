
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UsersManagement = () => {
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

  const handlePlaceholderClick = () => {
    toast({
      title: "Coming Soon",
      description: "User management functionality will be available in a future update.",
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This feature is coming soon. You'll be able to manage user accounts, permissions, and view user activity.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Button onClick={handlePlaceholderClick}>View All Users</Button>
          <Button onClick={handlePlaceholderClick} variant="outline">View Approval Requests</Button>
        </div>
      </div>
    </Layout>
  );
};

export default UsersManagement;
