
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { isSessionExpired } from '@/utils/securityUtils';
import { AppRole } from '@/types/auth';
import ApprovedRoute from '@/components/ApprovedRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
  requiredRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiresAdmin = false,
  requiredRoles = []
}) => {
  const { user, isLoading, isAdmin, hasRole, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Additional session security check
  useEffect(() => {
    if (session) {
      // Check for session expiration
      const lastActivity = parseInt(localStorage.getItem('lastUserActivity') || '0');
      if (lastActivity > 0 && isSessionExpired(lastActivity)) {
        toast({
          title: "Session expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
    }
  }, [session, navigate, toast]);
  
  // Check for role requirements
  useEffect(() => {
    if (user) {
      // Check admin requirement
      if (requiresAdmin && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/products');
        return;
      }

      // Check for specific roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          toast({
            title: "Access Denied",
            description: "You don't have the required role to access this page.",
            variant: "destructive",
          });
          navigate('/products');
          return;
        }
      }
    }
  }, [user, requiresAdmin, isAdmin, requiredRoles, hasRole, navigate, toast]);

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

  // Redirect if required role is not met
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/products" replace />;
    }
  }

  // For admin routes, bypass approval check
  if (requiresAdmin) {
    return <>{children}</>;
  }

  // For regular routes, check approval status
  return (
    <ApprovedRoute>
      {children}
    </ApprovedRoute>
  );
};

export default ProtectedRoute;
