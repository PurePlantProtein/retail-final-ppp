import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

// Interface for search parameters
export interface UserSearchParams {
  search?: string;
  status?: string;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export const fetchUsers = async (params?: UserSearchParams): Promise<any[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*');
    
    if (params?.search) {
      query = query.or(`email.ilike.%${params.search}%,business_name.ilike.%${params.search}%`);
    }
    
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    
    if (params?.sort) {
      const { field, direction } = params.sort;
      query = query.order(field, { ascending: direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert to UserProfile type
    return { 
      id: userId,
      role: (data.role as 'admin' | 'retailer') || 'retailer', // Default role if not present
      business_name: data.business_name || '',
      business_address: data.business_address,
      phone: data.phone,
      business_type: data.business_type,
      email: data.email
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert to UserProfile type
    return { 
      id: userId,
      role: (data.role as 'admin' | 'retailer') || 'retailer',
      business_name: data.business_name || '',
      business_address: data.business_address,
      phone: data.phone,
      business_type: data.business_type,
      email: data.email
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<UserProfile | null> => {
  return updateUserProfile(userId, { role: role as 'admin' | 'retailer' });
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: isActive ? 'active' : 'inactive' })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const updateUserDetails = async (userId: string, userData: Partial<UserProfile>): Promise<UserProfile | null> => {
  return updateUserProfile(userId, userData);
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
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

// Function to delete all users except the specified email
export const deleteAllUsersExcept = async (exceptEmail: string): Promise<void> => {
  try {
    // First get the user to keep (to make sure we don't delete it)
    const { data: keepUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', exceptEmail)
      .single();

    if (fetchError) {
      console.error('Error finding user to keep:', fetchError);
      throw fetchError;
    }

    if (!keepUser) {
      console.error('Could not find user with email:', exceptEmail);
      return;
    }

    // Delete all users except the one to keep
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', keepUser.id);

    if (deleteError) {
      console.error('Error deleting test users:', deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted all users except ${exceptEmail}`);
  } catch (error) {
    console.error('Error in deleteAllUsersExcept:', error);
    throw error;
  }
};
