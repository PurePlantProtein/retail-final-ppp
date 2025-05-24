
import { useState } from 'react';
import { useUsersFetch } from './users/useUsersFetch';
import { useUserRoles } from './users/useUserRoles';
import { useUserStatus } from './users/useUserStatus';
import { useUserActions } from './users/useUserActions';
import { useUserFilters } from './users/useUserFilters';
import { AppRole } from '@/types/auth';

export const useUsersManagement = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  
  // Compose all the user management hooks
  const { users, isLoading, fetchUsers } = useUsersFetch();
  const { updateUserRole, removeUserRole } = useUserRoles(fetchUsers);
  const { toggleUserStatus } = useUserStatus();
  const { updateUserDetails, deleteUser } = useUserActions(fetchUsers);
  const { searchTerm, setSearchTerm, activeTab, setActiveTab, getFilteredUsers } = useUserFilters(users);

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
