
import { useState, useEffect, useCallback } from 'react';
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

  // Stable role checking functions
  const hasRole = useCallback((role: AppRole) => {
    return roles.includes(role);
  }, [roles]);
  
  const isAdmin = hasRole('admin');
  const isDistributor = hasRole('distributor');
  const isRetailer = hasRole('retailer');

  // Function to load user profile
  const loadUserProfile = useCallback(async (userId: string) => {
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

      if (data) {
        setProfile({
          id: data.id,
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          phone: data.phone || '',
          business_type: data.business_type || '',
          email: data.email || '',
          payment_terms: data.payment_terms || 14,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  // Function to load user roles
  const loadUserRoles = useCallback(async (userId: string) => {
    try {
      console.log('Loading roles for user:', userId);
      const userRoles = await fetchUserRoles(userId);
      setRoles(userRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    }
  }, []);

  // Function to refresh profile and roles
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id);
      await loadUserRoles(user.id);
    }
  }, [user, loadUserProfile, loadUserRoles]);

  // Initialize auth state once
  useEffect(() => {
    if (isInitialized) return;

    console.log('useAuthState: Initializing auth...');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthState: Error getting session:', error);
        }

        if (mounted) {
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

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('useAuthState: Auth state changed:', event);
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user && event === 'SIGNED_IN') {
              // Load user data after sign in
              setTimeout(async () => {
                if (mounted) {
                  await loadUserProfile(session.user.id);
                  await loadUserRoles(session.user.id);
                }
              }, 100);
            } else if (!session) {
              // Clear data on sign out
              setProfile(null);
              setRoles([]);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('useAuthState: Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, [isInitialized, loadUserProfile, loadUserRoles]);

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
