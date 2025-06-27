
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthMethods = (onActivityUpdate: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (
    email: string, 
    password: string, 
    businessName: string, 
    businessType: string,
    additionalData?: {
      phone?: string;
      business_address?: string;
      contact_name?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            business_name: businessName,
            business_type: businessType,
            phone: additionalData?.phone || '',
            business_address: additionalData?.business_address || '',
            contact_name: additionalData?.contact_name || '',
            email: email // Include email in metadata for the trigger
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful:', data);
      
      // Send notification to sales team about new signup
      if (data.user) {
        try {
          await supabase.functions.invoke('send-user-notification', {
            body: {
              type: 'signup',
              userEmail: email,
              userName: additionalData?.contact_name || 'Unknown',
              businessName: businessName,
              businessType: businessType
            }
          });
          console.log('Sales team notification sent successfully');
        } catch (notificationError) {
          console.error('Failed to send sales team notification:', notificationError);
          // Don't throw here - user signup was successful, notification failure shouldn't block them
        }
      }
      
      onActivityUpdate();
      return data;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful for:', email);
      onActivityUpdate();
      return data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    login,
    logout,
    isLoading
  };
};
