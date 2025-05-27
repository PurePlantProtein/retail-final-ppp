
import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, X, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { approveUser, rejectUser } from '@/services/userProfileService';

interface PendingUser {
  id: string;
  email: string;
  business_name: string;
  business_type: string;
  created_at: string;
}

const UserApprovalRequests: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, business_name, business_type, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: "Error",
        description: "Failed to load pending users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!user) return;
    
    const userToApprove = pendingUsers.find(u => u.id === userId);
    if (!userToApprove) return;
    
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      await approveUser(userId, user.id);
      
      // Send approval notification to the user
      try {
        await supabase.functions.invoke('send-user-notification', {
          body: {
            type: 'approval',
            userEmail: userToApprove.email,
            userName: userToApprove.business_name,
            businessName: userToApprove.business_name,
            businessType: userToApprove.business_type
          }
        });
        console.log("Approval notification sent to user");
      } catch (notificationError) {
        console.error("Failed to send approval notification:", notificationError);
        // Don't fail the approval if notification fails
      }
      
      toast({
        title: "User Approved",
        description: "User has been approved and notified via email.",
      });
      await fetchPendingUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (!user) return;
    
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      await rejectUser(userId, user.id);
      toast({
        title: "User Rejected",
        description: "User application has been rejected.",
      });
      await fetchPendingUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user.",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Approval Requests</CardTitle>
          <CardDescription>
            New retailer accounts requiring approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Approval Requests</CardTitle>
        <CardDescription>
          New retailer accounts requiring approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-center">
            <div>
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No pending approval requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                New signup requests will appear here for your approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((pendingUser) => (
              <div
                key={pendingUser.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pendingUser.business_name}</h4>
                    <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    <p className="text-xs text-gray-500">
                      {pendingUser.business_type} • Applied {new Date(pendingUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(pendingUser.id)}
                    disabled={processingUsers.has(pendingUser.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(pendingUser.id)}
                    disabled={processingUsers.has(pendingUser.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserApprovalRequests;
