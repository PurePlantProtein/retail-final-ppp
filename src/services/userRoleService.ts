
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/auth';

/**
 * Fetch roles for a specific user
 */
export const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }

    return data.map(item => item.role as AppRole);
  } catch (error) {
    console.error('Error in fetchUserRoles:', error);
    return [];
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, newRole: AppRole) => {
  try {
    // First check if the role already exists for this user
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', newRole);

    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw checkError;
    }

    // If role doesn't exist, add it
    if (!existingRole || existingRole.length === 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });
      
      if (insertError) {
        console.error('Error adding user role:', insertError);
        throw insertError;
      }
    }
    
    return {
      success: true,
      message: `User role updated to ${newRole}`
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Remove a user role
 */
export const removeUserRole = async (userId: string, roleToRemove: AppRole) => {
  try {
    // Never remove the last role from a user
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking existing roles:', checkError);
      throw checkError;
    }

    // If this is the only role, don't remove it
    if (existingRoles.length <= 1) {
      return {
        success: false,
        message: "Cannot remove the user's only role"
      };
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', roleToRemove);
    
    if (error) {
      console.error('Error removing user role:', error);
      throw error;
    }
    
    return {
      success: true,
      message: `Role ${roleToRemove} removed successfully`
    };
  } catch (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
};
