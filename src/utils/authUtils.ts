
import { clearAuthData } from './browserCleanup';

// Helper function to clean up auth state
export const cleanupAuthState = () => {
  try {
    // Use the enhanced cleanup utility
    clearAuthData();
    
    // Additional cleanup for any remaining items
    localStorage.removeItem('supabase.auth.token');
    
    console.log('Auth state cleanup completed');
    return true;
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
    return false;
  }
};

// Helper function to check if a user is an admin
export const checkIsAdmin = (roles: string[]): boolean => {
  return roles.includes('admin');
};

// Helper function for emergency auth reset
export const emergencyAuthReset = () => {
  try {
    // Clear all browser data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('Emergency auth reset completed');
    return true;
  } catch (error) {
    console.error('Error during emergency auth reset:', error);
    return false;
  }
};
