
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const useUsersFetch = () => {
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
        const userRoles = roles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: userRoles,
          isAdmin: userRoles.includes('admin'),
          isDistributor: userRoles.includes('distributor'),
          isRetailer: userRoles.includes('retailer'),
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

  return {
    isLoading,
    users,
    fetchUsers,
    setUsers
  };
};
