
import { useState } from 'react';
import { useUsersFetch } from './useUsersFetch';
import { useUserRoles } from './useUserRoles';
import { useUserStatus } from './useUserStatus';
import { useUserActions } from './useUserActions';
import { useUserFilters } from './useUserFilters';
import { useCreateUserDialog } from './useCreateUserDialog';

export const useUsersManagement = () => {
  // Compose all the user management hooks
  const { users, isLoading, fetchUsers } = useUsersFetch();
  const { updateUserRole, removeUserRole } = useUserRoles(fetchUsers);
  const { toggleUserStatus } = useUserStatus();
  const { updateUserDetails, deleteUser } = useUserActions(fetchUsers);
  const { searchTerm, setSearchTerm, activeTab, setActiveTab, getFilteredUsers } = useUserFilters(users);
  const { isCreateUserDialogOpen, setIsCreateUserDialogOpen } = useCreateUserDialog();

  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isCreateUserDialogOpen,
    setIsCreateUserDialogOpen,
    fetchUsers,
    updateUserRole,
    removeUserRole,
    toggleUserStatus,
    updateUserDetails,
    deleteUser,
    getFilteredUsers
  };
};
