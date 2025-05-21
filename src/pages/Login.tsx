
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

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
    <Layout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#212529] dark:to-[#343a40] border-none shadow-lg">
          <CardHeader className="space-y-6 text-center pt-8">
            <div className="flex justify-center">
              <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" 
                   alt="PP Protein" 
                   className="h-16 w-auto mb-2" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#212529] dark:text-white">Welcome back</CardTitle>
            <CardDescription className="text-[#495057] dark:text-[#adb5bd]">
              Enter your email and password to login to your wholesale account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#343a40] dark:text-[#f8f9fa]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-[#ced4da] dark:bg-[#495057] dark:border-[#6c757d] focus-visible:ring-[#25a18e]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#343a40] dark:text-[#f8f9fa]">Password</Label>
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
                  className="bg-white border-[#ced4da] dark:bg-[#495057] dark:border-[#6c757d] focus-visible:ring-[#25a18e]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-[#25a18e] hover:bg-[#1e8a77] text-white transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center pb-8">
            <p className="text-sm text-[#6c757d] dark:text-[#adb5bd]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#25a18e] hover:text-[#1e8a77] hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
