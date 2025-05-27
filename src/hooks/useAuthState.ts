
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, AppRole } from '@/types/auth';
import { useFetchProfile } from '@/hooks/useFetchProfile';
import { fetchUserRoles } from '@/services/userService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Use the custom hook to fetch profile
  const { fetchProfile } = useFetchProfile(user, setProfile);

  // Function to load user roles
  const loadUserRoles = useCallback(async (userId: string) => {
    try {
      console.log('Loading user roles for:', userId);
      const userRoles = await fetchUserRoles(userId);
      console.log('User roles loaded:', userRoles);
      setRoles(userRoles);
    } catch (error) {
      console.error("Error loading user roles:", error);
      setRoles([]);
    }
  }, []);

  // Add a function to refresh the profile and roles
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
      await loadUserRoles(user.id);
    }
  }, [user, fetchProfile, loadUserRoles]);

  // Role checking functions - now always called in the same order
  const hasRole = useCallback((role: AppRole) => {
    return roles.includes(role);
  }, [roles]);
  
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);
  
  const isDistributor = useCallback(() => {
    return hasRole('distributor');
  }, [hasRole]);
  
  const isRetailer = useCallback(() => {
    return hasRole('retailer');
  }, [hasRole]);

  // Initialize auth once
  useEffect(() => {
    console.log('useAuthState: Initializing auth...');
    
    let cleanup: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        // Set up auth listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('useAuthState: Auth state changed:', event, session?.user?.email || 'No session');
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user && event === 'SIGNED_IN') {
              // Defer profile and roles loading to prevent blocking
              setTimeout(async () => {
                try {
                  console.log('useAuthState: Loading profile and roles for user:', session.user.id);
                  await fetchProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                } catch (error) {
                  console.error('Error loading user data:', error);
                }
              }, 100);
            } else if (!session) {
              console.log('useAuthState: No session, clearing profile and roles');
              setProfile(null);
              setRoles([]);
            }
          }
        );

        cleanup = () => {
          console.log('useAuthState: Cleaning up auth subscription');
          subscription.unsubscribe();
        };

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthState: Error getting session:', error);
        } else {
          console.log('useAuthState: Initial session retrieved:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Load profile and roles for existing session
            setTimeout(async () => {
              try {
                console.log('useAuthState: Loading initial profile and roles');
                await fetchProfile(session.user.id);
                await loadUserRoles(session.user.id);
              } catch (error) {
                console.error('Error loading initial user data:', error);
              }
            }, 100);
          }
        }
        
        setIsLoading(false);
        setInitialized(true);
        console.log('useAuthState: Auth initialization complete');
        
      } catch (err) {
        console.error('useAuthState: Error initializing auth:', err);
        setIsLoading(false);
        setInitialized(true);
      }
    };
    
    initAuth();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchProfile, loadUserRoles]);

  return {
    user,
    profile,
    roles,
    isLoading,
    session,
    hasRole,
    isAdmin: isAdmin(),
    isDistributor: isDistributor(),
    isRetailer: isRetailer(),
    refreshProfile
  };
};
