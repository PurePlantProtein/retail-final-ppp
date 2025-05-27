
import React from 'react';
import { User } from '@/types/user';
import { AppRole } from '@/types/auth';
import UserTableRow from './UserTableRow';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <TableHeader>
        <TableRow>
          <TableHead>Business</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
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
            updateUserRole={updateUserRole}
            removeUserRole={removeUserRole}
            toggleUserStatus={toggleUserStatus}
            currentUser={currentUser}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTableContainer;
