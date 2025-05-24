
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User } from '@/types/user';
import { AppRole } from '@/types/auth';

interface UserTableRowProps {
  user: User;
  currentUser: any;
  updateUserRole: (userId: string, role: AppRole, addRole: boolean) => Promise<boolean>;
  removeUserRole?: (userId: string, role: AppRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  currentUser,
  updateUserRole,
  removeUserRole,
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
      case 'distributor':
        return 'bg-orange-500 hover:bg-orange-600';
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
    // Convert string status to boolean for the toggleUserStatus function
    const isActive = user.status !== 'Active';
    await toggleUserStatus(user.id, isActive);
  };

  const handleUpdateRole = async (role: AppRole) => {
    await updateUserRole(user.id, role, true);
  };

  const handleRemoveRole = async (role: AppRole) => {
    if (removeUserRole) {
      await removeUserRole(user.id, role);
    }
  };
  
  // Check if user has a specific role
  const hasRole = (role: AppRole) => {
    return user.roles && user.roles.includes(role);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.business_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.business_type || '-'}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.map((role) => (
            <Badge key={role} className={`${getRoleBadgeColor(role)} flex items-center gap-1`}>
              {role}
              {canEditRole && removeUserRole && role !== 'retailer' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRole(role as AppRole);
                  }}
                  className="ml-1 hover:bg-red-400 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
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
                <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                
                {!hasRole('admin') && (
                  <DropdownMenuItem onClick={() => handleUpdateRole('admin')}>
                    <Plus className="mr-2 h-4 w-4" /> Add Admin Role
                  </DropdownMenuItem>
                )}
                
                {!hasRole('distributor') && (
                  <DropdownMenuItem onClick={() => handleUpdateRole('distributor')}>
                    <Plus className="mr-2 h-4 w-4" /> Add Distributor Role
                  </DropdownMenuItem>
                )}
                
                {!hasRole('retailer') && (
                  <DropdownMenuItem onClick={() => handleUpdateRole('retailer')}>
                    <Plus className="mr-2 h-4 w-4" /> Add Retailer Role
                  </DropdownMenuItem>
                )}
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
