
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { cleanupAuthState } from '@/utils/authUtils';

// Helper function for manual account creation (for testing only)
const createAdminAccount = async () => {
  try {
    // First, attempt to sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'myles@sparkflare.com.au',
      password: 'PPPWholesale123!@',
      options: {
        data: {
          business_name: 'Sparkflare Admin'
        }
      }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('Error creating account:', signUpError);
      return;
    }
    
    console.log('Admin account created or already exists');
    
  } catch (error) {
    console.error('Error in admin account creation:', error);
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to /products
  const from = (location.state as { from?: string })?.from || '/products';
  
  // Clean up any existing session data on login page mount
  useEffect(() => {
    // Clean up existing auth state when landing on login page
    cleanupAuthState();
    localStorage.removeItem('lastUserActivity');
    
    // Check URL parameters for session_expired flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired') === 'true') {
      setErrorMessage("Your session has expired. Please log in again.");
      // Clear the flag from the URL
      navigate('/login', { replace: true });
    }
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Create admin account on component load (only for development)
  useEffect(() => {
    createAdminAccount();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For development, try direct login first without captcha
      // This will work if captcha verification is disabled in Supabase
      await login(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // If we get a captcha error, show a more specific message
      if (error.message?.includes('captcha') || error.message?.includes('CAPTCHA')) {
        setErrorMessage("Captcha verification failed. Please try again or use another browser. For development, you can disable CAPTCHA in Supabase settings.");
        
        // For production, you would use the Supabase Auth UI or implement hCaptcha directly
        // See: https://supabase.com/docs/guides/auth/auth-captcha
      } else {
        setErrorMessage(error.message || "Invalid login credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* White login section - full width on mobile, 45% on desktop */}
      <div className="w-full md:w-[45%] p-6 md:p-12 flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <img 
              src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" 
              alt="PP Protein" 
              className="h-10 mb-8" 
            />
            <h1 className="text-3xl font-bold mb-2">Sign in to your account</h1>
            <p className="text-gray-600">Enter your details below to access your wholesale account</p>
          </div>

          {errorMessage && (
            <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm mb-4 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#25a18e] hover:text-[#1e8a77] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#25a18e] hover:bg-[#1e8a77]" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-8">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#25a18e] hover:text-[#1e8a77] font-medium hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Image section - hidden on mobile, 55% on desktop */}
      <div 
        className="hidden md:block md:w-[55%] bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('/lovable-uploads/e8d0fa9a-8140-44aa-8386-93b48950ecc1.png')`
        }}
      ></div>
    </div>
  );
};

export default Login;
