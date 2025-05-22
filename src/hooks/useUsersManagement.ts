
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/components/admin/UsersTable';
import * as userService from '@/services/userService';

export const useUsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-users');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const fetchUsers = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await userService.updateUserRole(userId, newRole);
      
      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole}.`,
      });
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = await userService.toggleUserStatus(userId, currentStatus);
      
      toast({
        title: "Status Updated",
        description: `User status updated to ${newStatus}.`,
      });
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
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
      await userService.updateUserDetails(userId, userData);

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, ...userData } : u
        )
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating user details:', error);
      return Promise.reject(error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting user:', error);
      return Promise.reject(error);
    }
  };

  // Filter users based on search term and active tab
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === 'all-users') return matchesSearch;
      if (activeTab === 'retailers') return matchesSearch && user.role === 'retailer';
      if (activeTab === 'admins') return matchesSearch && user.role === 'admin';
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
    toggleUserStatus,
    updateUserDetails,
    deleteUser,
    getFilteredUsers
  };
};
