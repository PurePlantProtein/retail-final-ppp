
import React from 'react';
import { User } from '@/types/user';
import { AppRole } from '@/types/auth';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ResetPasswordButton from './ResetPasswordButton';

interface UserTableRowProps {
  user: User;
  updateUserRole: (userId: string, role: AppRole, addRole: boolean) => Promise<boolean>;
  removeUserRole?: (userId: string, role: AppRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  currentUser: any;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  updateUserRole,
  removeUserRole,
  toggleUserStatus,
  currentUser,
  onEditClick,
  onDeleteClick,
}) => {
  const isCurrentUser = currentUser?.id === user.id;
  const isActive = user.status === 'Active';

  const handleStatusToggle = async (checked: boolean) => {
    await toggleUserStatus(user.id, checked);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'distributor': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{user.business_name}</div>
          <div className="text-sm text-gray-500">{user.business_type}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{user.phone}</div>
          <div className="text-gray-500">{user.business_address}</div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.roles?.map((role) => (
            <Badge key={role} variant={getRoleBadgeVariant(role)}>
              {role}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch
            id={`status-${user.id}`}
            checked={isActive}
            onCheckedChange={handleStatusToggle}
            disabled={isCurrentUser}
          />
          <Label htmlFor={`status-${user.id}`} className="text-sm">
            {isActive ? 'Active' : 'Inactive'}
          </Label>
        </div>
      </TableCell>
      <TableCell>{user.payment_terms} days</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditClick(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <ResetPasswordButton 
            userEmail={user.email} 
            userName={user.business_name} 
          />
          {!isCurrentUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteClick(user)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
