
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/components/admin/UsersTable';
import * as userService from '@/services/userService';
import { UserProfile, AppRole } from '@/types/auth';

export const useUsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-users');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await userService.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await userService.updateUserRole(userId, newRole);
      
      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole}.`,
      });
      
      // Refresh the user list to reflect the new roles
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const removeUserRole = async (userId: string, roleToRemove: string) => {
    try {
      const result = await userService.removeUserRole(userId, roleToRemove);
      
      if (result.success) {
        toast({
          title: "Role Removed",
          description: `${roleToRemove} role has been removed.`,
        });
        
        // Refresh the user list to reflect the updated roles
        fetchUsers();
      } else {
        toast({
          title: "Cannot Remove Role",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing user role:', error);
      toast({
        title: "Error",
        description: "Failed to remove user role.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      // Convert string status to boolean for the API
      const isCurrentlyActive = currentStatus === 'Active';
      const newStatus = await userService.toggleUserStatus(userId, !isCurrentlyActive);
      
      toast({
        title: "Status Updated",
        description: `User status updated to ${newStatus?.status || (!isCurrentlyActive ? 'Active' : 'Inactive')}.`,
      });
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, status: newStatus?.status || (!isCurrentlyActive ? 'Active' : 'Inactive') } : u
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const updateUserDetails = async (userId: string, userData: Partial<User>) => {
    try {
      // Convert User type to UserProfile type for the API
      const userProfileData: Partial<UserProfile> = {
        business_name: userData.business_name,
        business_type: userData.business_type,
        business_address: userData.business_address,
        phone: userData.phone,
        email: userData.email,
        payment_terms: userData.payment_terms
      };
      
      await userService.updateUserDetails(userId, userProfileData);

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, ...userData } : u
        )
      );

      toast({
        title: "Success",
        description: "User details updated successfully.",
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating user details:', error);
      
      toast({
        title: "Error",
        description: "Failed to update user details.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      
      // Update local state after successful deletion
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      toast({
        title: "Success",
        description: "User has been successfully deleted.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting user:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  // Filter users based on search term and active tab
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
        (user.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (user.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
      
      if (activeTab === 'all-users') return matchesSearch;
      if (activeTab === 'retailers') return matchesSearch && user.roles && user.roles.includes('retailer');
      if (activeTab === 'distributors') return matchesSearch && user.roles && user.roles.includes('distributor');
      if (activeTab === 'admins') return matchesSearch && user.roles && user.roles.includes('admin');
      return matchesSearch;
    });
  };

  return {
    users,
    searchTerm,
    setSearchTerm,
    isLoading,
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
