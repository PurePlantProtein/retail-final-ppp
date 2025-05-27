
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import LoginErrorMessage from '@/components/auth/LoginErrorMessage';
import LoginBackground from '@/components/auth/LoginBackground';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: string })?.from || '/products';
  
  // Check for session expired flag only once
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired') === 'true') {
      setErrorMessage("Your session has expired. Please log in again.");
      // Clean up URL without causing navigation loops
      window.history.replaceState({}, '', '/login');
    }
  }, []);
  
  // Handle redirect when user is authenticated
  useEffect(() => {
    if (!authLoading && !hasCheckedSession) {
      setHasCheckedSession(true);
      
      if (user) {
        console.log('Login: User already logged in, redirecting to:', from);
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from, authLoading, hasCheckedSession]);

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

  // Show loading state while auth is loading
  if (authLoading || !hasCheckedSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-[45%] p-6 lg:p-12 flex items-center justify-center bg-white order-2 lg:order-1">
        <div className="w-full max-w-md">
          <LoginHeader />

          {errorMessage && (
            <LoginErrorMessage message={errorMessage} />
          )}

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
      
      <LoginBackground />
    </div>
  );
};

export default Login;
