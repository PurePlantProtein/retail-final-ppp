
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserTableRow from '@/components/admin/users/UserTableRow';
import LoadingState from '@/components/admin/users/LoadingState';
import EmptyState from '@/components/admin/users/EmptyState';
import { User } from '@/types/user';
import { AppRole } from '@/types/auth';

interface UsersTableContainerProps {
  users: User[];
  updateUserRole: (userId: string, role: AppRole, addRole: boolean) => Promise<boolean>;
  removeUserRole?: (userId: string, role: AppRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  currentUser: any;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

const UsersTableContainer: React.FC<UsersTableContainerProps> = ({ 
  users, 
  updateUserRole,
  removeUserRole,
  toggleUserStatus, 
  currentUser,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <Table>
      <TableCaption>List of users in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Business Type</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Terms</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserTableRow
            key={user.id}
            user={user}
            currentUser={currentUser}
            updateUserRole={updateUserRole}
            removeUserRole={removeUserRole}
            toggleUserStatus={toggleUserStatus}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTableContainer;
