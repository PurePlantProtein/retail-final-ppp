
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { isSessionExpired, SESSION_TIMEOUT_MS } from '@/utils/securityUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiresAdmin = false 
}) => {
  const { user, isLoading, isAdmin, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Additional session security check
  useEffect(() => {
    if (session) {
      // Check for session expiration
      const lastActivity = parseInt(localStorage.getItem('lastUserActivity') || '0');
      if (isSessionExpired(lastActivity)) {
        toast({
          title: "Session expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Update the last activity timestamp
      localStorage.setItem('lastUserActivity', Date.now().toString());
    }
  }, [session, navigate]);
  
  // Check for admin requirement
  useEffect(() => {
    if (user && requiresAdmin && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
    }
  }, [user, requiresAdmin, isAdmin, navigate]);

  // Show nothing while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect if admin route but not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
