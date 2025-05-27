
import React from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/useAuthMethods';
import { useAuthSessionMonitor } from '@/hooks/useAuthSessionMonitor';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    refreshProfile,
    isInitialized
  } = useAuthState();
  
  const authMethods = useAuthMethods(() => {
    // Update activity callback - simplified
    localStorage.setItem('lastUserActivity', Date.now().toString());
  });
  
  useAuthSessionMonitor(session, async () => await authMethods.logout());

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
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
