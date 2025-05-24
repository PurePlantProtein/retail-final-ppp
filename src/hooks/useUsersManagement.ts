import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { AppRole } from '@/types/auth';

export const useUsersManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
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
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, toast]);

  return {
    users,
    isLoading,
    fetchUsers,
    updateUserRole,
    deleteUser
  };
};
