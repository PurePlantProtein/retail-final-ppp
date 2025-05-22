
import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCog } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  created_at: string;
  business_name: string;
  business_type: string;
  status: string;
  role: string;
}

interface UsersTableProps {
  users: User[];
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: string) => Promise<void>;
  currentUser: any;
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  updateUserRole, 
  toggleUserStatus, 
  currentUser,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>List of users in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.business_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.business_type || 'Not specified'}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                  disabled={user.id === currentUser?.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="retailer">
                      <div className="flex items-center">
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Retailer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUserStatus(user.id, user.status)}
                  disabled={user.id === currentUser?.id}
                >
                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
