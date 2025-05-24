
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
      // First, try to fetch profiles which contains user details
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (userRolesError) throw userRolesError;

      // Create a map of user IDs to their roles
      const userRolesMap = new Map();
      userRoles.forEach(role => {
        if (!userRolesMap.has(role.user_id)) {
          userRolesMap.set(role.user_id, []);
        }
        userRolesMap.get(role.user_id).push(role.role);
      });

      // Map profiles to users with roles
      const usersWithDetails = profiles.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        created_at: profile.created_at,
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        business_address: profile.business_address || '',
        phone: profile.phone || '',
        payment_terms: profile.payment_terms || 14,
        status: 'Active', // Default status
        roles: userRolesMap.get(profile.id) || ['retailer'],
        isAdmin: userRolesMap.has(profile.id) && userRolesMap.get(profile.id).includes('admin'),
        isDistributor: userRolesMap.has(profile.id) && userRolesMap.get(profile.id).includes('distributor'),
        isRetailer: userRolesMap.has(profile.id) && userRolesMap.get(profile.id).includes('retailer'),
      }));
      
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
