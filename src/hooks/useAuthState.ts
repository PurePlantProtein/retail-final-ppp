
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
  const [mounted, setMounted] = useState(false);
  
  // Use the custom hook to fetch profile
  const { fetchProfile } = useFetchProfile(user, setProfile);

  // Function to load user roles
  const loadUserRoles = async (userId: string) => {
    try {
      console.log('Loading user roles for:', userId);
      const userRoles = await fetchUserRoles(userId);
      console.log('User roles loaded:', userRoles);
      setRoles(userRoles);
    } catch (error) {
      console.error("Error loading user roles:", error);
      setRoles([]);
    }
  };

  // Add a function to refresh the profile and roles
  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
      await loadUserRoles(user.id);
    }
  };

  // Role checking functions
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

  useEffect(() => {
    console.log('useAuthState: Component mounting');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      console.log('useAuthState: Not mounted yet, skipping');
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('useAuthState: Initializing auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthState: Error getting session:', error);
        }
        
        if (!isMounted) {
          console.log('useAuthState: Component unmounted during session fetch');
          return;
        }
        
        console.log('useAuthState: Session retrieved:', session?.user?.email || 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to defer these calls and prevent hydration issues
          setTimeout(async () => {
            if (isMounted) {
              console.log('useAuthState: Fetching profile and roles for user:', session.user.id);
              await fetchProfile(session.user.id);
              await loadUserRoles(session.user.id);
            }
          }, 0);
        }
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) {
              console.log('useAuthState: Component unmounted, ignoring auth change');
              return;
            }
            
            console.log('useAuthState: Auth state changed:', event, session?.user?.email || 'No session');
            setUser(session?.user ?? null);
            setSession(session);
            
            if (session?.user) {
              setTimeout(async () => {
                if (isMounted) {
                  console.log('useAuthState: Auth change - fetching profile and roles');
                  await fetchProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                }
              }, 0);
            } else {
              console.log('useAuthState: No session, clearing profile and roles');
              setProfile(null);
              setRoles([]);
            }
          }
        );

        setIsLoading(false);
        console.log('useAuthState: Auth initialization complete');

        return () => {
          console.log('useAuthState: Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('useAuthState: Error initializing auth:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();

    return () => {
      console.log('useAuthState: Component unmounting');
      isMounted = false;
    };
  }, [mounted, fetchProfile]);

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
