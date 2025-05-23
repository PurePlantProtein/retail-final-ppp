
import { supabase } from '@/integrations/supabase/client';
import { User, UserProfile, UserSearchParams } from '@/types/auth';

export const fetchUsers = async (params?: UserSearchParams): Promise<User[]> => {
  try {
    let query = supabase
      .from('users')
      .select('*');
    
    if (params?.search) {
      query = query.or(`email.ilike.%${params.search}%,name.ilike.%${params.search}%`);
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
    
    // Ensure the returned object has an id property
    return { 
      id: userId,
      ...data 
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
    
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};
