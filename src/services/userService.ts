
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
    
    // Get auth users to match with profiles for email addresses
    const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      // Continue with profiles data only
    }
    
    // Create a map of auth users by ID for easy lookup
    const authUsersMap = new Map();
    if (authUsersData?.users) {
      authUsersData.users.forEach(user => {
        authUsersMap.set(user.id, user);
      });
    }
    
    // Convert profiles to users format
    const users: User[] = profilesData.map(profile => {
      // Try to get email from auth users map first, then from profile
      const authUser = authUsersMap.get(profile.id);
      const email = authUser?.email || profile.email || profile.id;
      
      // Determine role based on email
      const isUserAdmin = ['admin@example.com', 'myles@sparkflare.com.au'].includes(email);
      
      return {
        id: profile.id,
        email: email,
        created_at: profile.created_at,
        business_name: profile.business_name || 'Unknown',
        business_type: profile.business_type || 'Not specified',
        business_address: profile.business_address,
        phone: profile.phone,
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
    // This would be where you'd make the actual API call
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string, currentStatus: string): Promise<string> => {
  try {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    
    // In a real implementation, you would update the status in the database
    console.log(`User status updated for ${userId} to ${newStatus}`);
    
    return newStatus;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const updateUserDetails = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
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

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log('Attempting to delete user with ID:', userId);
    
    // First attempt to delete the user from auth.users (which will cascade to profiles)
    // Use the service role key to perform this admin operation
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Error deleting user from auth.users:', authError);
        throw authError;
      }
      
      console.log('User successfully deleted from auth.users');
    } catch (authDeleteError) {
      console.error('Failed to delete from auth.users, falling back to profiles deletion:', authDeleteError);
      
      // If failing to delete from auth, at least remove from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error deleting from profiles table:', profileError);
        throw profileError;
      }
      
      console.log('User successfully deleted from profiles table');
    }
  } catch (error) {
    console.error('Error in deleteUser function:', error);
    throw error;
  }
};
