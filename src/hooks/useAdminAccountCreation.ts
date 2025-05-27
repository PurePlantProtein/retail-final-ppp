
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function for manual account creation (for testing only)
const createAdminAccount = async () => {
  try {
    console.log('Checking if admin account exists...');
    
    // First check if user already exists by trying to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'myles@sparkflare.com.au',
      password: 'PPPWholesale123!@'
    });
    
    if (signInData?.user) {
      console.log('Admin account already exists and is accessible');
      // Sign out immediately since this is just a check
      await supabase.auth.signOut();
      return;
    }
    
    // Only attempt signup if sign in failed with invalid credentials
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('Admin account does not exist, creating...');
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'myles@sparkflare.com.au',
        password: 'PPPWholesale123!@',
        options: {
          data: {
            business_name: 'Sparkflare Admin'
          }
        }
      });
      
      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Error creating account:', signUpError);
        return;
      }
      
      console.log('Admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }
    
  } catch (error) {
    console.error('Error in admin account creation:', error);
  }
};

export const useAdminAccountCreation = () => {
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Only run once per session and avoid running during auth operations
    if (hasAttempted) return;
    
    const checkAndCreateAdmin = async () => {
      setHasAttempted(true);
      await createAdminAccount();
    };
    
    // Delay the check to avoid interfering with auth initialization
    const timer = setTimeout(checkAndCreateAdmin, 3000); // Increased delay
    
    return () => clearTimeout(timer);
  }, [hasAttempted]);
};
