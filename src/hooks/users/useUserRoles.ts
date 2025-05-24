
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { AppRole } from '@/types/auth';

export const useUserRoles = (fetchUsers: () => Promise<void>) => {
  const { toast } = useToast();

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

  return {
    updateUserRole,
    removeUserRole
  };
};
