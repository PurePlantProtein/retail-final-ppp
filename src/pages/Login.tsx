
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cleanupAuthState } from '@/utils/authUtils';
import { useAdminAccountCreation } from '@/hooks/useAdminAccountCreation';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import LoginErrorMessage from '@/components/auth/LoginErrorMessage';
import LoginBackground from '@/components/auth/LoginBackground';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to /products
  const from = (location.state as { from?: string })?.from || '/products';
  
  // Use the admin account creation hook
  useAdminAccountCreation();
  
  // Set mounted state and handle initial cleanup
  useEffect(() => {
    console.log('Login: Component mounting');
    setMounted(true);
    
    // Clean up auth state on mount
    cleanupAuthState();
    localStorage.removeItem('lastUserActivity');
    
    // Check URL parameters for session_expired flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired') === 'true') {
      setErrorMessage("Your session has expired. Please log in again.");
      // Clear the flag from the URL
      navigate('/login', { replace: true });
    }
    
    return () => {
      console.log('Login: Component unmounting');
    };
  }, [navigate]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!mounted || authLoading) return;
    
    if (user) {
      console.log('Login: User already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, mounted, authLoading]);

  const handleSubmit = async (email: string, password: string) => {
    console.log('Login: Form submitted');
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Login: Attempting login for:', email);
      await login(email, password);
      console.log('Login: Login successful');
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state until mounted and auth is ready
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* White login section */}
      <div className="w-full lg:w-[45%] p-6 lg:p-12 flex items-center justify-center bg-white order-2 lg:order-1">
        <div className="w-full max-w-md">
          <LoginHeader />

          {errorMessage && (
            <LoginErrorMessage message={errorMessage} />
          )}

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Image section */}
      <LoginBackground />
    </div>
  );
};

export default Login;
