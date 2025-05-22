
import React, { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserProfile } from '@/types/auth';
import { useFetchProfile } from '@/hooks/useFetchProfile';
import { cleanupAuthState, isAdminUser } from '@/utils/authUtils';
import { isSessionExpired, SESSION_TIMEOUT_MS } from '@/utils/securityUtils';

// Create the context with undefined as initial value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const { toast } = useToast();
  
  // Use the custom hook to fetch profile
  const { fetchProfile } = useFetchProfile(user, setProfile);

  // Add a function to refresh the profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Track user activity to handle session timeouts
  const updateActivity = useCallback(() => {
    const timestamp = Date.now();
    setLastActivity(timestamp);
    localStorage.setItem('lastUserActivity', timestamp.toString());
  }, []);

  // Check for session expiration
  useEffect(() => {
    const checkSession = () => {
      const storedLastActivity = parseInt(localStorage.getItem('lastUserActivity') || '0');
      if (session && storedLastActivity > 0 && isSessionExpired(storedLastActivity)) {
        toast({
          title: "Session expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "destructive",
        });
        logout();
      }
    };

    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    
    // Add event listeners to track user activity
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    
    // Initialize lastUserActivity if not set
    if (!localStorage.getItem('lastUserActivity')) {
      updateActivity();
    }
    
    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [session, updateActivity]);

  useEffect(() => {
    const setupAuth = async () => {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          setUser(session?.user ?? null);
          setSession(session); // Store the session
          if (session?.user) {
            // Use setTimeout to prevent auth deadlocks
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 0);
            // Update the activity timestamp
            updateActivity();
          } else {
            setProfile(null);
          }
        }
      );

      // THEN check for existing session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session); // Store the session
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          updateActivity(); // Update activity timestamp on session retrieval
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setIsLoading(false);
      }

      return () => subscription.unsubscribe();
    };
    
    setupAuth();
  }, []);

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
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Welcome to PP Protein Wholesale!",
      });
    } catch (error: any) {
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

  const value = {
    user,
    profile,
    isLoading,
    login,
    signup,
    logout,
    isAdmin: isAdminUser(user),
    session,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
