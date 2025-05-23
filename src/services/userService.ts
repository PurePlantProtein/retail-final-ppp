
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
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert to UserProfile type
    return { 
      id: userId,
      role: data.role as 'admin' | 'retailer' || 'retailer', // Default role if not present
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
    // Filter out properties that don't exist in the profiles table
    const validProfileData: Record<string, any> = {};
    
    if (profileData.business_name !== undefined) validProfileData.business_name = profileData.business_name;
    if (profileData.business_address !== undefined) validProfileData.business_address = profileData.business_address;
    if (profileData.phone !== undefined) validProfileData.phone = profileData.phone;
    if (profileData.business_type !== undefined) validProfileData.business_type = profileData.business_type;
    if (profileData.email !== undefined) validProfileData.email = profileData.email;
    if (profileData.role !== undefined) validProfileData.role = profileData.role;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(validProfileData)
      .eq('id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert to UserProfile type
    return { 
      id: userId,
      role: data.role as 'admin' | 'retailer' || 'retailer',
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
      .update({ 
        // Only include status if it's a field in the profiles table
        status: isActive ? 'active' : 'inactive' 
      })
      .eq('id', userId)
      .select()
      .maybeSingle();
    
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
