
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import UsersTableContainer from '@/components/admin/users/UsersTableContainer';
import EditUserDialog from '@/components/admin/users/EditUserDialog';
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog';
import LoadingState from '@/components/admin/users/LoadingState';
import EmptyState from '@/components/admin/users/EmptyState';
import { useUserDialogs } from '@/hooks/users/useUserDialogs';
import { User } from '@/types/user';
import { AppRole } from '@/types/auth';

interface UsersTableProps {
  users: User[];
  updateUserRole: (userId: string, role: AppRole, addRole: boolean) => Promise<boolean>;
  removeUserRole?: (userId: string, role: AppRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  updateUserDetails?: (userId: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser?: (userId: string) => Promise<boolean>;
  currentUser: any;
  isLoading: boolean;
  onEditClick?: (user: User) => void;
  onPricingTierChange?: (tierId: string) => Promise<boolean | void>;
  currentPricingTierId?: string | null;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  updateUserRole,
  removeUserRole,
  toggleUserStatus, 
  updateUserDetails,
  deleteUser,
  currentUser,
  isLoading,
  onEditClick,
  onPricingTierChange,
  currentPricingTierId
}) => {
  const { toast } = useToast();
  const {
    editingUser,
    setEditingUser,
    editFormData,
    setEditFormData,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    userToDelete,
    setUserToDelete,
    isDeletingUser,
    setIsDeletingUser,
    initEditFormData,
    handleEditInputChange
  } = useUserDialogs();

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (users.length === 0) {
    return <EmptyState />;
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    initEditFormData(user);
    setIsEditDialogOpen(true);
    
    // Call the parent onEditClick if provided
    if (onEditClick) {
      onEditClick(user);
    }
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
      <UsersTableContainer 
        users={users}
        updateUserRole={updateUserRole}
        removeUserRole={removeUserRole}
        toggleUserStatus={toggleUserStatus}
        currentUser={currentUser}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        editingUser={editingUser}
        editFormData={editFormData}
        onInputChange={handleEditInputChange}
        onFormSubmit={handleEditFormSubmit}
        onPricingTierChange={onPricingTierChange}
        currentPricingTierId={currentPricingTierId}
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
