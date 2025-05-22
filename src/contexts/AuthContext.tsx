
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  business_name: string;
  business_address?: string;
  phone?: string;
  business_type?: string;
  email?: string;
  role: 'admin' | 'retailer';
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, businessName: string, businessType?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  session: Session | null; // Adding this property to the type
  refreshProfile: () => Promise<void>; // Add this new function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For development purposes only - to identify admin users
const ADMIN_EMAILS = ['admin@example.com', 'myles@sparkflare.com.au'];

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null); // Adding this state
  const { toast } = useToast();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Don't throw here - we'll still set the user's role based on email
      }
      
      // Determine role based on email (in a real app, this would come from the database)
      const role = ADMIN_EMAILS.includes(user?.email || '') ? 'admin' : 'retailer';
      
      if (data) {
        setProfile({ ...data, role });
        console.log('User profile loaded:', { ...data, role });
      } else {
        // Create a minimal profile if one doesn't exist
        setProfile({ 
          id: userId, 
          business_name: user?.user_metadata?.business_name || 'Unknown Business',
          email: user?.email,
          role
        });
        console.log('Created minimal profile with email:', user?.email);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  // Add a function to refresh the profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
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
    isAdmin: ADMIN_EMAILS.includes(user?.email || ''),
    session, // Add the session to the context value
    refreshProfile, // Add the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
