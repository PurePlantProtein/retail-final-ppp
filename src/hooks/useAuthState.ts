
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to defer these calls and prevent hydration issues
          setTimeout(async () => {
            if (isMounted) {
              await fetchProfile(session.user.id);
              await loadUserRoles(session.user.id);
            }
          }, 0);
        }
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state changed:', event, session?.user?.email);
            setUser(session?.user ?? null);
            setSession(session);
            
            if (session?.user) {
              setTimeout(async () => {
                if (isMounted) {
                  await fetchProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                }
              }, 0);
            } else {
              setProfile(null);
              setRoles([]);
            }
          }
        );

        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();

    return () => {
      isMounted = false;
    };
  }, [mounted]);

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
