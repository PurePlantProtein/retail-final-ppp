
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from '@/utils/authUtils';

export const useAuthMethods = (updateActivity: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('useAuthMethods: Starting login process');
      
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('useAuthMethods: Global signout completed');
      } catch (err) {
        console.log('useAuthMethods: Global signout failed, continuing...');
      }
      
      console.log('useAuthMethods: Attempting sign in');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('useAuthMethods: Sign in error:', error);
        throw error;
      }
      
      console.log('useAuthMethods: Sign in successful');
      
      // Reset the last activity timestamp
      updateActivity();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
    } catch (error: any) {
      console.error('useAuthMethods: Login failed:', error);
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, businessName: string, businessType?: string, phone?:string, businessAddress?:string) => {
    setIsLoading(true);
    
    try {
      // Clean up existing state
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            business_type: businessType || ''
          }
        }
      });

      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            email: email,
            phone: phone,
            business_address: businessAddress
          })
          .eq("id", data.user.id);
      }
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup success:", data);
      
      // Send notification to sales team about new signup
      try {
        await supabase.functions.invoke('send-user-notification', {
          body: {
            type: 'signup',
            userEmail: email,
            userName: businessName,
            businessName: businessName,
            businessType: businessType
          }
        });
        console.log("Sales notification sent successfully");
      } catch (notificationError) {
        console.error("Failed to send sales notification:", notificationError);
      }
      
      // Reset the last activity timestamp
      updateActivity();
      
      toast({
        title: "Account created",
        description: "Welcome to PPP Retailers!",
      });
    } catch (error: any) {
      console.error("Signup error caught:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('useAuthMethods: Starting logout process');
      
      // Clean up auth state first
      cleanupAuthState();
      localStorage.removeItem('lastUserActivity');
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      console.log('useAuthMethods: Logout completed, redirecting...');
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (error: any) {
      console.error('useAuthMethods: Logout error:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return {
    login,
    signup,
    logout,
    authLoading: isLoading
  };
};
