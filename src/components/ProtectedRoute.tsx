
import React, { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Session security check
  useEffect(() => {
    if (!mounted || !session || !user || isLoading) return;

    const lastActivity = parseInt(localStorage.getItem('lastUserActivity') || '0');
    if (lastActivity > 0 && isSessionExpired(lastActivity)) {
      console.log('ProtectedRoute: Session expired');
      toast({
        title: "Session expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [session, navigate, toast, user, isLoading, mounted]);
  
  // Role requirements check
  useEffect(() => {
    if (!mounted || !user || isLoading) return;

    console.log('ProtectedRoute: Checking role requirements', { requiresAdmin, requiredRoles, isAdmin });
    
    if (requiresAdmin && !isAdmin) {
      console.log('ProtectedRoute: Admin required but user not admin');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }

    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        console.log('ProtectedRoute: Required role not found');
        toast({
          title: "Access Denied",
          description: "You don't have the required role to access this page.",
          variant: "destructive",
        });
        navigate('/products');
        return;
      }
    }
  }, [user, requiresAdmin, isAdmin, requiredRoles, hasRole, navigate, toast, mounted, isLoading]);

  // Show loading while not mounted or auth is loading
  if (!mounted || isLoading) {
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
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect if admin route but not admin
  if (requiresAdmin && !isAdmin) {
    console.log('ProtectedRoute: Admin required, redirecting to products');
    return <Navigate to="/products" replace />;
  }

  // Redirect if required role is not met
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      console.log('ProtectedRoute: Required role not met, redirecting to products');
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
