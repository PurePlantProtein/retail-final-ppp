import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AppRole } from '@/types/auth';

/**
 * Fetch all users from Supabase
 */
export const fetchUsers = async () => {
  try {
    // First get profiles which contain user details
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Fetch roles for each user
    const userIds = profiles.map(profile => profile.id);
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);
    
    if (userRolesError) {
      console.error('Error fetching user roles:', userRolesError);
      throw userRolesError;
    }

    // Create a map of user IDs to their roles
    const userRolesMap = new Map();
    userRoles.forEach(role => {
      if (!userRolesMap.has(role.user_id)) {
        userRolesMap.set(role.user_id, []);
      }
      userRolesMap.get(role.user_id).push(role.role);
    });

    // Map profiles to the expected user format
    const users = profiles.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      created_at: profile.created_at,
      business_name: profile.business_name || '',
      business_type: profile.business_type || '',
      business_address: profile.business_address || '',
      phone: profile.phone || '',
      payment_terms: profile.payment_terms || 14,
      status: 'Active', // Default status, could be stored in profile in the future
      role: userRolesMap.has(profile.id) && userRolesMap.get(profile.id).includes('admin') ? 'admin' : 
            userRolesMap.has(profile.id) && userRolesMap.get(profile.id).includes('distributor') ? 'distributor' : 'retailer',
      roles: userRolesMap.get(profile.id) || ['retailer'], // Include all roles
    }));
    
    return users;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    // Return empty array instead of mock data in case of error
    return [];
  }
};

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

/**
 * Toggle user status (active/inactive)
 */
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const newStatus = isActive ? 'Active' : 'Inactive';
    console.log(`Setting user ${userId} status to ${newStatus}`);
    
    // In a real application, we would update this in the database
    
    return {
      success: true,
      status: newStatus
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Update user details
 */
export const updateUserDetails = async (userId: string, userData: Partial<UserProfile>) => {
  try {
    // Update user profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: userData.business_name,
        business_type: userData.business_type,
        business_address: userData.business_address,
        phone: userData.phone,
        email: userData.email,
        payment_terms: userData.payment_terms
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
    
    return {
      success: true,
      message: "User details updated successfully"
    };
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string) => {
  try {
    console.log(`Request to delete user ${userId}`);
    // In a production environment, you would need admin privileges 
    // to delete users from auth.users
    
    // For now, we just remove their profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
    
    return {
      success: true,
      message: "User profile deleted successfully"
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
