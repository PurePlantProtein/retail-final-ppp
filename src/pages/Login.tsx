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
import { Star } from 'lucide-react';

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

const Testimonial = ({ name, content, rating = 5 }) => (
  <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
    <div className="flex items-center mb-2">
      <div className="flex space-x-0.5 text-yellow-500">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 mb-3 text-sm">{content}</p>
    <p className="font-medium text-gray-900">{name}</p>
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
              <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm mb-4">
                {errorMessage}
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
        
        {/* Right side - Image and Testimonials */}
        <div className="hidden md:block md:w-[55%] bg-gradient-to-br from-[#f8f9fa] to-[#e2d1c3] relative">
          <div className="absolute inset-0 bg-[#25a18e]/10"></div>
          <div className="h-full overflow-y-auto p-10 relative z-10">
            <div className="max-w-lg mx-auto">
              <img 
                src="https://ppprotein.com.au/cdn/shop/products/apple-crumble-protein-donut-mix-160g-pp-protein-573315_1000x.jpg?v=1647926271" 
                alt="PP Protein Products" 
                className="w-full h-64 object-cover rounded-xl mb-8" 
              />
              
              <h2 className="text-2xl font-bold mb-6 text-gray-800">What our customers are saying</h2>
              
              <Testimonial 
                name="Sarah T., Health Food Store" 
                content="PP Protein wholesale has transformed our store's protein section. The products are always high quality and our customers love them. The ordering process is seamless!"
              />
              
              <Testimonial 
                name="Michael R., Gym Owner" 
                content="Our gym members have been thrilled with the PP Protein products we stock. The wholesale pricing allows us to offer great deals while maintaining good margins."
              />
              
              <Testimonial 
                name="Jennifer K., Nutritionist" 
                content="I recommend PP Protein products to all my clients. The wholesale platform makes it easy for me to purchase in bulk for my practice."
                rating={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
