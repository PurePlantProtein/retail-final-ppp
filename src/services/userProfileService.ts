
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

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
      roles: userRolesMap.get(profile.id) || ['retailer'], // Ensure roles is always an array
      pricing_tier_id: undefined, // Will be populated separately if needed
      approval_status: profile.approval_status || 'pending',
      approved_at: profile.approved_at,
      approved_by: profile.approved_by,
    }));
    
    return users;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    // Return empty array instead of mock data in case of error
    return [];
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
 * Approve user account
 */
export const approveUser = async (userId: string, approvedBy: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error approving user:', error);
      throw error;
    }
    
    return {
      success: true,
      message: "User approved successfully"
    };
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

/**
 * Reject user account
 */
export const rejectUser = async (userId: string, rejectedBy: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'rejected',
        approved_by: rejectedBy
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
    
    return {
      success: true,
      message: "User rejected successfully"
    };
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string) => {
  try {
    console.log(`Request to remove user ${userId}`);
    
    // Remove user profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
    
    // Remove user roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    return {
      success: true,
      message: "User removed successfully"
    };
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
};
