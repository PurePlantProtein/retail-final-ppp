import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import UserTableRow from '@/components/admin/users/UserTableRow';
import EditUserDialog from '@/components/admin/users/EditUserDialog';
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog';
import LoadingState from '@/components/admin/users/LoadingState';
import EmptyState from '@/components/admin/users/EmptyState';
import { AppRole } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  created_at: string;
  business_name: string;
  business_type: string;
  status: string;
  role: string;
  roles?: AppRole[];
  business_address?: string;
  phone?: string;
  payment_terms?: number;
}

interface UsersTableProps {
  users: User[];
  updateUserRole: (userId: string, role: AppRole, addRole: boolean) => Promise<boolean>;
  removeUserRole?: (userId: string, role: AppRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  updateUserDetails?: (userId: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser?: (userId: string) => Promise<boolean>;
  currentUser: any;
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  updateUserRole,
  removeUserRole,
  toggleUserStatus, 
  updateUserDetails,
  deleteUser,
  currentUser,
  isLoading
}) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (users.length === 0) {
    return <EmptyState />;
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      business_name: user.business_name,
      business_type: user.business_type,
      business_address: user.business_address || '',
      phone: user.phone || '',
      email: user.email,
      payment_terms: user.payment_terms
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormSubmit = async () => {
    if (!editingUser || !updateUserDetails) return;
    
    try {
      await updateUserDetails(editingUser.id, editFormData);
      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !deleteUser) return;
    
    try {
      setIsDeletingUser(true);
      await deleteUser(userToDelete.id);
      toast({
        title: "User deleted",
        description: `${userToDelete.business_name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="overflow-x-auto">
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
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        editingUser={editingUser}
        editFormData={editFormData}
        onInputChange={handleEditInputChange}
        onFormSubmit={handleEditFormSubmit}
      />

      {/* Delete User Confirmation Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        userToDelete={userToDelete}
        isDeleting={isDeletingUser}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UsersTable;
