
import React from 'react';
import { Edit, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import { TableRow, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { User } from '@/components/admin/UsersTable';

interface UserTableRowProps {
  user: User;
  currentUser: any;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: string) => Promise<void>;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  currentUser,
  updateUserRole,
  toggleUserStatus,
  onEditClick,
  onDeleteClick
}) => {
  return (
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
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleUserStatus(user.id, user.status)}
            disabled={user.id === currentUser?.id}
          >
            {user.status === 'Active' ? 'Suspend' : 'Activate'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditClick(user)}
            disabled={user.id === currentUser?.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteClick(user)}
            disabled={user.id === currentUser?.id}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
