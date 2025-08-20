
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { checkIsAdmin } from '@/utils/authUtils';

export const useFetchProfile = (
  user: User | null,
  onProfileLoaded: (profile: UserProfile) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching profile for user:', userId);
      
      // First, check if the profile exists
      const { data: fetchedData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // If no profile exists, create one
  let data = fetchedData;
  if (error || !data) {
        console.log('Profile not found, creating profile for user:', userId);
        
        // Get user email from auth.users indirectly through the session
        const email = user?.email || '';
        
        // Create a new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            business_name: user?.user_metadata?.business_name || 'Unknown Business',
            email: email,
            payment_terms: 14, // Default payment terms
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Even if insert fails, we'll set a minimal profile
        } else {
          data = newProfile;
          console.log('Created new profile:', data);
        }
      }
      
      if (data) {
        const profileData = { ...data, email: user?.email };
        onProfileLoaded(profileData as UserProfile);
        console.log('User profile loaded:', profileData);
      } else {
        // Create a minimal profile if one doesn't exist
        const minimalProfile: UserProfile = { 
          id: userId, 
          business_name: user?.user_metadata?.business_name || 'Unknown Business',
          email: user?.email,
          payment_terms: 14, // Default payment terms
        };
        onProfileLoaded(minimalProfile);
        console.log('Created minimal profile with email:', user?.email);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      // Set minimal profile even if there's an error
      if (user) {
        const minimalProfile: UserProfile = { 
          id: user.id, 
          business_name: user.user_metadata?.business_name || 'Unknown Business',
          email: user.email,
          payment_terms: 14, // Default payment terms
        };
        onProfileLoaded(minimalProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchProfile, isLoading };
};
