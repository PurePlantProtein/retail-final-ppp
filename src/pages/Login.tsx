
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
  const { login, user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired') === 'true') {
      setErrorMessage("Your session has expired. Please log in again.");
      window.history.replaceState({}, '', '/login');
    }
  }, []);
  
  useEffect(() => {
    // Only redirect if auth is fully loaded and user exists
    if (!authLoading && user) {
      console.log('Login: User already logged in, isAdmin:', isAdmin);
      const redirectPath = isAdmin ? '/admin' : '/products';
      console.log('Login: Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, authLoading, isAdmin]);

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
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while user exists (redirecting)
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
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <LoginHeader />

          {errorMessage && (
            <LoginErrorMessage message={errorMessage} />
          )}

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need access? Contact your administrator for account setup.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Background */}
      <div className="hidden lg:block lg:w-1/2">
        <LoginBackground />
      </div>
    </div>
  );
};

export default Login;
