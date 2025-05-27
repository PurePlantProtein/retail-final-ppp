
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, AppRole } from '@/types/auth';
import { fetchUserRoles } from '@/services/userService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMountedRef = useRef(true);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  const hasRole = useCallback((role: AppRole) => {
    return roles.includes(role);
  }, [roles]);
  
  const isAdmin = hasRole('admin');
  const isDistributor = hasRole('distributor');
  const isRetailer = hasRole('retailer');

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

  const loadUserRoles = useCallback(async (userId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      console.log('Loading roles for user:', userId);
      const userRoles = await fetchUserRoles(userId);
      if (isMountedRef.current) {
        setRoles(userRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      if (isMountedRef.current) {
        setRoles([]);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && isMountedRef.current) {
      await Promise.all([
        loadUserProfile(user.id),
        loadUserRoles(user.id)
      ]);
    }
  }, [user, loadUserProfile, loadUserRoles]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeAuth = async () => {
      if (initializationPromiseRef.current) {
        return initializationPromiseRef.current;
      }

      initializationPromiseRef.current = (async () => {
        try {
          console.log('useAuthState: Starting initialization...');
          
          // Get current session first
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('useAuthState: Error getting session:', error);
            throw error;
          }

          console.log('useAuthState: Initial session:', !!initialSession);
          
          if (isMountedRef.current) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            if (initialSession?.user) {
              await Promise.all([
                loadUserProfile(initialSession.user.id),
                loadUserRoles(initialSession.user.id)
              ]);
            }
          }

          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (!isMountedRef.current) return;
              
              console.log('useAuthState: Auth state changed:', event, !!session);
              
              setSession(session);
              setUser(session?.user ?? null);
              
              if (event === 'SIGNED_IN' && session?.user) {
                // Use setTimeout to prevent potential deadlocks
                setTimeout(async () => {
                  if (isMountedRef.current) {
                    await Promise.all([
                      loadUserProfile(session.user.id),
                      loadUserRoles(session.user.id)
                    ]);
                  }
                }, 0);
              } else if (event === 'SIGNED_OUT' || !session) {
                if (isMountedRef.current) {
                  setProfile(null);
                  setRoles([]);
                }
              }
            }
          );

          // Cleanup function
          const cleanup = () => {
            subscription.unsubscribe();
            isMountedRef.current = false;
          };

          // Store cleanup function for later use
          (window as any).__authCleanup = cleanup;

        } catch (error) {
          console.error('useAuthState: Initialization error:', error);
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        }
      })();

      return initializationPromiseRef.current;
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      if ((window as any).__authCleanup) {
        (window as any).__authCleanup();
        delete (window as any).__authCleanup;
      }
    };
  }, [loadUserProfile, loadUserRoles]);

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
    isInitialized: !isLoading
  };
};
