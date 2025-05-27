
import { useEffect } from 'react';

// Admin account creation is permanently disabled to prevent startup errors
// This was causing 422 errors and React render issues during app initialization
export const useAdminAccountCreation = () => {
  useEffect(() => {
    console.log('Admin account creation hook is disabled to prevent startup errors');
  }, []);
  
  // Return empty object for compatibility
  return {};
};
