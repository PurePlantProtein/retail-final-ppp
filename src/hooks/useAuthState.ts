
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, AppRole } from '@/types/auth';
import { fetchUserRoles } from '@/services/userService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use ref to prevent updates after unmount
  const isMountedRef = useRef(true);

  // Stable role checking functions
  const hasRole = useCallback((role: AppRole) => {
    return roles.includes(role);
  }, [roles]);
  
  const isAdmin = hasRole('admin');
  const isDistributor = hasRole('distributor');
  const isRetailer = hasRole('retailer');

  // Function to safely update state only if mounted
  const safeSetState = useCallback((updateFn: () => void) => {
    if (isMountedRef.current) {
      updateFn();
    }
  }, []);

  // Function to load user profile
  const loadUserProfile = useCallback(async (userId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data && isMountedRef.current) {
        safeSetState(() => {
          setProfile({
            id: data.id,
            business_name: data.business_name || '',
            business_address: data.business_address || '',
            phone: data.phone || '',
            business_type: data.business_type || '',
            email: data.email || '',
            payment_terms: data.payment_terms || 14,
          });
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [safeSetState]);

  // Function to load user roles
  const loadUserRoles = useCallback(async (userId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      console.log('Loading roles for user:', userId);
      const userRoles = await fetchUserRoles(userId);
      if (isMountedRef.current) {
        safeSetState(() => setRoles(userRoles));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      if (isMountedRef.current) {
        safeSetState(() => setRoles([]));
      }
    }
  }, [safeSetState]);

  // Function to refresh profile and roles
  const refreshProfile = useCallback(async () => {
    if (user && isMountedRef.current) {
      await loadUserProfile(user.id);
      await loadUserRoles(user.id);
    }
  }, [user, loadUserProfile, loadUserRoles]);

  // Single effect to handle all auth initialization
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('useAuthState: Initializing auth...');
        
        // Set up auth state listener first
        const { data: authData } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted || !isMountedRef.current) return;
            
            console.log('useAuthState: Auth state changed:', event);
            
            // Update session and user synchronously
            setSession(session);
            setUser(session?.user ?? null);
            
            // Handle different auth events
            if (event === 'SIGNED_IN' && session?.user) {
              // Defer data loading to prevent race conditions
              setTimeout(async () => {
                if (mounted && isMountedRef.current) {
                  await loadUserProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                }
              }, 100);
            } else if (event === 'SIGNED_OUT' || !session) {
              // Clear data on sign out
              if (mounted && isMountedRef.current) {
                setProfile(null);
                setRoles([]);
              }
            }
          }
        );
        
        authSubscription = authData.subscription;

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthState: Error getting session:', error);
        }

        if (mounted && isMountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Load user data if session exists
          if (session?.user) {
            await loadUserProfile(session.user.id);
            await loadUserRoles(session.user.id);
          }
          
          setIsLoading(false);
          setIsInitialized(true);
        }

      } catch (error) {
        console.error('useAuthState: Error initializing auth:', error);
        if (mounted && isMountedRef.current) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      isMountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once

  // Cleanup ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    user,
    profile,
    roles,
    isLoading,
    session,
    hasRole,
    isAdmin,
    isDistributor,
    isRetailer,
    refreshProfile,
    isInitialized
  };
};
