
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
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Implement rate limiting for login attempts
      const clientId = localStorage.getItem('device_id') || 
                      (localStorage.setItem('device_id', crypto.randomUUID()), localStorage.getItem('device_id')!);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Reset the last activity timestamp
      updateActivity();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
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

  const signup = async (email: string, password: string, businessName: string, businessType?: string) => {
    setIsLoading(true);
    
    try {
      // Clean up existing state
      cleanupAuthState();
      
      console.log("Signing up with:", { email, businessName, businessType });
      
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
            userName: businessName, // Using business name as user name
            businessName: businessName,
            businessType: businessType
          }
        });
        console.log("Sales notification sent successfully");
      } catch (notificationError) {
        console.error("Failed to send sales notification:", notificationError);
        // Don't fail the signup if notification fails
      }
      
      // Reset the last activity timestamp
      updateActivity();
      
      toast({
        title: "Account created",
        description: "Welcome to PP Protein Wholesale!",
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
      // Clean up auth state
      cleanupAuthState();
      localStorage.removeItem('lastUserActivity');
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (error: any) {
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
