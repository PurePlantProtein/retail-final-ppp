
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function for manual account creation (for testing only)
const createAdminAccount = async () => {
  try {
    console.log('Creating admin account...');
    // First, attempt to sign up
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
    
    console.log('Admin account created or already exists');
    
  } catch (error) {
    console.error('Error in admin account creation:', error);
  }
};

export const useAdminAccountCreation = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    createAdminAccount();
  }, [mounted]);
};
