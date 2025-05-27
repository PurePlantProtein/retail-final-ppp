
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

  // Role checking functions - stable and consistent
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

  // Simplified auth initialization
  useEffect(() => {
    console.log('useAuthState: Setting up auth...');
    
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('useAuthState: Auth state changed:', event, session?.user?.email || 'No session');
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user && event === 'SIGNED_IN') {
              // Defer profile and roles loading slightly
              setTimeout(async () => {
                if (!mounted) return;
                try {
                  console.log('useAuthState: Loading profile and roles for user:', session.user.id);
                  await fetchProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                } catch (error) {
                  console.error('Error loading user data:', error);
                }
              }, 50);
            } else if (!session) {
              console.log('useAuthState: No session, clearing profile and roles');
              setProfile(null);
              setRoles([]);
            }
          }
        );

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthState: Error getting session:', error);
        } else if (mounted) {
          console.log('useAuthState: Initial session retrieved:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Load profile and roles for existing session
            setTimeout(async () => {
              if (!mounted) return;
              try {
                console.log('useAuthState: Loading initial profile and roles');
                await fetchProfile(session.user.id);
                await loadUserRoles(session.user.id);
              } catch (error) {
                console.error('Error loading initial user data:', error);
              }
            }, 50);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
          console.log('useAuthState: Auth initialization complete');
        }
        
        return () => {
          console.log('useAuthState: Cleaning up auth subscription');
          subscription.unsubscribe();
        };
        
      } catch (err) {
        console.error('useAuthState: Error initializing auth:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    const cleanup = initAuth();

    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, []); // Empty dependency array for single initialization

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
