
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
  const loadUserRoles = async (userId: string) => {
    try {
      const userRoles = await fetchUserRoles(userId);
      setRoles(userRoles);
    } catch (error) {
      console.error("Error loading user roles:", error);
      setRoles([]);
    }
  };

  // Add a function to refresh the profile and roles
  const refreshProfile = async () => {
    if (user) {
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
    let isMounted = true;

    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state changed:', event, session?.user?.email);
            setUser(session?.user ?? null);
            setSession(session);
            
            if (session?.user) {
              // Use setTimeout to prevent auth deadlocks
              setTimeout(async () => {
                if (!isMounted) return;
                try {
                  await fetchProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                } catch (error) {
                  console.error('Error fetching user data:', error);
                }
              }, 0);
            } else {
              setProfile(null);
              setRoles([]);
            }
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        setSession(session);
        
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
            await loadUserRoles(session.user.id);
          } catch (error) {
            console.error('Error fetching initial user data:', error);
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error setting up auth:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    setupAuth();

    return () => {
      isMounted = false;
    };
  }, []);

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
