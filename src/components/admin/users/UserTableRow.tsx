
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  const isOwnAccount = user.id === currentUser?.id;
  const canEditRole = !isOwnAccount;
  const canToggleStatus = !isOwnAccount;
  const canDelete = !isOwnAccount;
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'retailer':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500 hover:bg-green-600';
      case 'Inactive':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'Pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const handleToggleStatus = async () => {
    await toggleUserStatus(user.id, user.status);
  };

  const handleUpdateRole = async (role: string) => {
    await updateUserRole(user.id, role);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.business_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.business_type || '-'}</TableCell>
      <TableCell>
        <Badge className={`${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={`${getStatusBadgeColor(user.status)}`}>
          {user.status}
        </Badge>
      </TableCell>
      <TableCell>
        {user.payment_terms !== undefined ? `${user.payment_terms} days` : '14 days'}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* Edit User */}
            <DropdownMenuItem onClick={() => onEditClick(user)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            
            {/* Role Management */}
            {canEditRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleUpdateRole('admin')} disabled={user.role === 'admin'}>
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateRole('retailer')} disabled={user.role === 'retailer'}>
                  Make Retailer
                </DropdownMenuItem>
              </>
            )}
            
            {/* Status Management */}
            {canToggleStatus && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {user.status === 'Active' ? 'Deactivate' : 'Activate'} Account
                </DropdownMenuItem>
              </>
            )}
            
            {/* Delete User */}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
