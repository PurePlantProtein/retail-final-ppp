
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/components/admin/UsersTable';
import * as userService from '@/services/userService';
import { UserProfile } from '@/types/auth';

// Fallback mock data in case the API fails
const mockUsers: User[] = [
  {
    id: '1',
    email: 'retailer@example.com',
    created_at: new Date().toISOString(),
    business_name: 'Demo Retail Business',
    business_type: 'Health Store',
    business_address: '123 Demo St, Example City',
    phone: '555-123-4567',
    payment_terms: 14,
    status: 'Active',
    role: 'retailer'
  },
  {
    id: '2',
    email: 'admin@example.com',
    created_at: new Date().toISOString(),
    business_name: 'Admin Account',
    business_type: 'Administrator',
    business_address: 'Admin HQ',
    phone: '555-987-6543',
    payment_terms: 30,
    status: 'Active',
    role: 'admin'
  }
];

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
      setUsers(fetchedUsers.length > 0 ? fetchedUsers : mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Using placeholder data.",
        variant: "destructive",
      });
      // Use mock data when API fails
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
        role: userData.role as 'admin' | 'retailer',
        payment_terms: userData.payment_terms
      };
      
      await userService.updateUserDetails(userId, userProfileData);

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
      console.log('Starting to delete user:', userId);
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
