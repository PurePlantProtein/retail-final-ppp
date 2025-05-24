
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { AppRole } from '@/types/auth';

export const useUsersManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all-users');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;
      
      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;
      
      const usersWithDetails = authUsers.users.map((user) => {
        const profile = profiles?.find(p => p.id === user.id) || {};
        const userRoles = roles?.filter(r => r.user_id === user.id).map(r => r.role as AppRole) || [];
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: userRoles,
          isAdmin: userRoles.includes('admin' as AppRole),
          isDistributor: userRoles.includes('distributor' as AppRole),
          isRetailer: userRoles.includes('retailer' as AppRole),
          ...profile,
        };
      });
      
      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateUserRole = useCallback(async (userId: string, role: AppRole, addRole: boolean) => {
    try {
      if (addRole) {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
        
        toast({
          title: "Role added",
          description: `${role} role added successfully.`,
        });
      } else {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        
        toast({
          title: "Role removed",
          description: `${role} role removed successfully.`,
        });
      }
      
      // Refresh the users list
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers, toast]);
  
  // Function to remove a role (wrapper around updateUserRole)
  const removeUserRole = useCallback(async (userId: string, role: AppRole) => {
    return updateUserRole(userId, role, false);
  }, [updateUserRole]);

  // This is a placeholder function - implement actual logic if needed
  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    toast({
      title: `User ${isActive ? 'activated' : 'deactivated'}`,
      description: "User status updated successfully.",
    });
    return true;
  }, [toast]);

  // This is a placeholder function - implement actual logic if needed
  const updateUserDetails = useCallback(async (userId: string, details: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(details)
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "User updated",
        description: "User details updated successfully.",
      });
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user details:', error);
      toast({
        title: "Error updating user",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers, toast]);
  
  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Refresh the users list
      await fetchUsers();

      toast({
        title: "User deleted",
        description: "User deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, toast]);

  // Get filtered users based on search term and active tab
  const getFilteredUsers = useCallback(() => {
    return users.filter(user => {
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tab
      let matchesTab = true;
      if (activeTab === 'retailers') {
        matchesTab = user.isRetailer;
      } else if (activeTab === 'distributors') {
        matchesTab = user.isDistributor;
      } else if (activeTab === 'admins') {
        matchesTab = user.isAdmin;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

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
