
import { User } from '@supabase/supabase-js';

// For development purposes only - to identify admin users
export const ADMIN_EMAILS = ['admin@example.com', 'myles@sparkflare.com.au'];

// Helper function to clean up auth state
export const cleanupAuthState = () => {
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

// Utility function to check if a user is an admin
export const isAdminUser = (user: User | null): boolean => {
  return ADMIN_EMAILS.includes(user?.email || '');
};

