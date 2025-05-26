
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock } from 'lucide-react';

interface ApprovedRouteProps {
  children: React.ReactNode;
}

const ApprovedRoute: React.FC<ApprovedRouteProps> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
      if (mounted && !user) {
        setIsLoading(false);
      }
      return;
    }

    console.log('ApprovedRoute: Checking approval status for user', user.id);

    // Admins bypass approval
    if (isAdmin) {
      console.log('ApprovedRoute: User is admin, bypassing approval check');
      setApprovalStatus('approved');
      setIsLoading(false);
      return;
    }

    const checkApproval = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('ApprovedRoute: Error checking approval status:', error);
          setApprovalStatus('pending');
        } else {
          console.log('ApprovedRoute: Approval status:', data?.approval_status);
          setApprovalStatus(data?.approval_status || 'pending');
        }
      } catch (error) {
        console.error('ApprovedRoute: Error checking approval status:', error);
        setApprovalStatus('pending');
      } finally {
        setIsLoading(false);
      }
    };

    checkApproval();
  }, [user, isAdmin, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking account status...</p>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is currently under review
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for registering with PP Protein Wholesale. Your account is currently being reviewed by our team.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive an email notification once your account has been approved and you can access the dashboard.
            </p>
            <div className="pt-4">
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Sign out
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Account Not Approved</CardTitle>
            <CardDescription>
              Your account application was not approved
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Unfortunately, your account application was not approved at this time.
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact our support team.
            </p>
            <div className="pt-4">
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Sign out
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is approved, show the protected content
  return <>{children}</>;
};

export default ApprovedRoute;
