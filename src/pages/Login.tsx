
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Star, AlertCircle } from 'lucide-react';
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

const Testimonial = ({ name, role, content, rating = 5 }) => (
  <div className="p-4 bg-white/90 rounded-lg shadow-sm mb-4 backdrop-blur-sm">
    <div className="flex items-center mb-2">
      <div className="flex space-x-0.5 text-yellow-500">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 mb-3 text-sm">{content}</p>
    <div>
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-500">{role}</p>
    </div>
  </div>
);

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
      await login(email, password);
      // Navigation happens in useEffect when user state changes
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid login credentials");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Single featured testimonial
  const featuredTestimonial = { 
    name: "Peter Murray",
    role: "Osteopath",
    content: "Meeting your daily protein intake is invaluable. I rely on PPP every day to ensure my recovery needs are met. Maintaining a healthy musculoskeletal system is crucial for optimising performance and minimising injury risks!",
    rating: 5
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Login Form */}
        <div className="w-full md:w-[45%] p-6 md:p-12 flex items-center justify-center">
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
        
        {/* Right side - Image and Single Static Testimonial */}
        <div 
          className="hidden md:block md:w-[55%] relative"
          style={{
            backgroundImage: `url('/lovable-uploads/f647823a-94e0-43cd-a72e-37a03ad8f464.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-[#25a18e]/30 backdrop-blur-sm"></div>
          <div className="h-full flex flex-col justify-center p-10 relative z-10">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-md">What our customers are saying</h2>
              
              <div>
                <Testimonial 
                  name={featuredTestimonial.name} 
                  role={featuredTestimonial.role}
                  content={featuredTestimonial.content}
                  rating={featuredTestimonial.rating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
