
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const UserApprovalRequests: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Approval Requests</CardTitle>
        <CardDescription>
          New retailer accounts requiring approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 text-center">
          <div>
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No pending approval requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              New signup requests will appear here for your approval.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserApprovalRequests;
