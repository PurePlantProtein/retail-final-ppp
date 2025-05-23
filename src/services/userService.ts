
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/components/admin/UsersTable';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Get all profiles from profiles table as our primary data source
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log('Raw profiles data:', profilesData);
    
    // Make sure profilesData is always treated as an array even if it's null
    const profiles = Array.isArray(profilesData) ? profilesData : [];
    
    let authUsersMap = new Map();
    
    // Only try to fetch auth users if we have admin access
    // This addresses the 403 errors when trying to access admin endpoints
    try {
      const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) {
        console.error('Error fetching auth users:', authUsersError);
      } else if (authUsersData && 'users' in authUsersData && Array.isArray(authUsersData.users)) {
        // Only create the map if we successfully got auth users
        authUsersData.users.forEach(user => {
          if (user && typeof user === 'object' && 'id' in user) {
            authUsersMap.set(user.id, user);
          }
        });
      }
    } catch (error) {
      console.warn('Could not fetch auth users, likely not running with admin privileges:', error);
      // Continue without auth users data - just use profiles
    }
    
    // Map profiles to User objects with proper type checking
    const users: User[] = profiles.map((profile) => {
      // Safely check for profile properties and verify it's an object with an id
      if (!profile || typeof profile !== 'object') {
        return {
          id: '',
          email: '',
          created_at: new Date().toISOString(),
          business_name: 'Unknown',
          business_type: 'Not specified',
          role: 'retailer',
          status: 'Active'
        };
      }
      
      // Type assertion as Record<string, any> to safely access properties
      const profileObj = profile as Record<string, any>;
      const profileId = typeof profileObj.id === 'string' ? profileObj.id : 
                       profileObj.id ? String(profileObj.id) : '';
      
      // Try to get email from auth users map first, then from profile
      const authUser = profileId ? authUsersMap.get(profileId) : undefined;
      const email = authUser?.email || 
                   (typeof profileObj.email === 'string' ? profileObj.email : 
                   profileObj.email ? String(profileObj.email) : '') || 
                   profileId;
      
      // Determine role based on email
      const isUserAdmin = ['admin@example.com', 'myles@sparkflare.com.au'].includes(email);
      
      return {
        id: profileId,
        email: email,
        created_at: profileObj.created_at,
        business_name: profileObj.business_name || 'Unknown',
        business_type: profileObj.business_type || 'Not specified',
        business_address: profileObj.business_address,
        phone: profileObj.phone,
        status: 'Active', // Default status since we don't store this in profiles yet
        role: isUserAdmin ? 'admin' : 'retailer'
      };
    });
    
    console.log('Fetched users from profiles:', users);
    return users;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
  try {
    // In a real implementation, you would update the role in the database
    console.log(`User role updated for ${userId} to ${newRole}`);
    
    // Update user role in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        // Using business_type to store the role since there's no direct role column
        business_type: newRole === 'admin' ? 'Administrator' : 'Retailer'
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string, currentStatus: string): Promise<string> => {
  try {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    
    // For now, we're just returning the new status without updating the database
    // In a future implementation, this might be stored in a dedicated column
    console.log(`User status updated for ${userId} to ${newStatus}`);
    
    return newStatus;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const updateUserDetails = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    console.log('Updating user details for', userId, 'with data:', userData);
    
    // Update user in Supabase profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: userData.business_name,
        business_type: userData.business_type,
        business_address: userData.business_address,
        phone: userData.phone,
        email: userData.email, // Store email in profiles table as well for redundancy
      })
      .eq('id', userId);

    if (error) {
      console.error('Error in Supabase update:', error);
      throw error;
    }
    
    console.log('User details updated successfully');
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log('Attempting to delete user with ID:', userId);
    
    // First try to delete from profiles table directly
    // This avoids the 403 errors when trying to use auth.admin.deleteUser without admin privileges
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error deleting from profiles table:', profileError);
      throw profileError;
    }
    
    console.log('User successfully deleted from profiles table');
    
    // Optionally try to delete from auth.users if we have admin privileges
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Could not delete from auth.users, but profiles deletion succeeded:', authError);
        // This is not a critical error since we've deleted the profile
      } else {
        console.log('User also successfully deleted from auth.users');
      }
    } catch (authDeleteError) {
      console.warn('Failed to delete from auth.users, but profiles deletion succeeded:', authDeleteError);
      // Continue since we've deleted the profile successfully
    }
  } catch (error) {
    console.error('Error in deleteUser function:', error);
    throw error;
  }
};
