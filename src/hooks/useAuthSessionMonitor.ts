
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";
import { isSessionExpired } from '@/utils/securityUtils';

export const useAuthSessionMonitor = (session: Session | null, logout: () => Promise<void>) => {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const { toast } = useToast();
  
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
  }, [session, updateActivity, toast, logout]);

  return { updateActivity };
};
