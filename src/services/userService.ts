
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
    
    // Also fetch auth users if possible (will work if user has admin rights)
    let authUsersData: any[] = [];
    try {
      // This might fail due to permissions, but we'll try anyway
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.log('Could not fetch auth users using admin API:', error);
      } else if (authUsers && authUsers.users && Array.isArray(authUsers.users)) {
        authUsersData = authUsers.users;
        console.log('Auth users data:', authUsersData);
      }
    } catch (err) {
      console.log('Could not fetch auth users, using profiles only:', err);
    }

    // Convert profiles to users format
    const users: User[] = profilesData.map(profile => {
      // Find matching auth user if available
      const matchingAuthUser = authUsersData.find(au => au.id === profile.id);
      
      // Determine role based on email - this is a temporary approach
      // In a production system, you would store roles in a database table
      const isUserAdmin = ['admin@example.com', 'myles@sparkflare.com.au'].includes(profile.email || '');
      
      return {
        id: profile.id,
        email: profile.email || profile.id,
        created_at: profile.created_at,
        business_name: profile.business_name || 'Unknown',
        business_type: profile.business_type || 'Not specified',
        business_address: profile.business_address,
        phone: profile.phone,
        status: 'Active',
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
    // For now, we'll just remove from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
