
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const useUserActions = (fetchUsers: () => Promise<void>) => {
  const { toast } = useToast();
  
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
    try {
      // We can only delete the profile, not the auth user without admin rights
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Remove user roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Refresh the users list
      await fetchUsers();

      toast({
        title: "User removed",
        description: "User has been removed successfully.",
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
    }
  }, [fetchUsers, toast]);

  return {
    updateUserDetails,
    deleteUser
  };
};
