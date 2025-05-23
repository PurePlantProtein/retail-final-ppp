
import React from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/useAuthMethods';
import { useAuthSessionMonitor } from '@/hooks/useAuthSessionMonitor';

// Create the context with undefined as initial value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our custom hooks to organize the logic
  const { 
    user, 
    profile, 
    roles,
    isLoading, 
    session, 
    hasRole,
    isAdmin,
    isDistributor,
    isRetailer,
    refreshProfile
  } = useAuthState();
  
  // Get session monitoring and activity tracking
  const { updateActivity } = useAuthSessionMonitor(session, async () => await authMethods.logout());
  
  // Get authentication methods
  const authMethods = useAuthMethods(updateActivity);

  const value: AuthContextType = {
    user,
    profile,
    isLoading: isLoading || authMethods.authLoading,
    login: authMethods.login,
    signup: authMethods.signup,
    logout: authMethods.logout,
    isAdmin,
    isDistributor,
    isRetailer,
    hasRole,
    roles,
    session,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
