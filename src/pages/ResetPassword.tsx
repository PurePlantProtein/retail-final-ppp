
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Star } from 'lucide-react';

const Testimonial = ({ name, content, rating = 5 }) => (
  <div className="p-4 bg-white/90 rounded-lg shadow-sm mb-4 backdrop-blur-sm">
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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from query string
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (!token) {
      setErrorMessage("Reset link is invalid or missing.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const body = await res.json();
      if (!res.ok || body?.error) throw new Error(body?.error || 'Reset failed');

      setIsSuccess(true);
      toast({ title: 'Success', description: 'Your password has been reset successfully.' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to reset password');
      toast({ title: 'Error', description: error.message || 'Failed to reset password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Form */}
        <div className="w-full md:w-[45%] p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <img 
                src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" 
                alt="PP Protein" 
                className="h-10 mb-8" 
                onError={(e)=>{(e.target as HTMLImageElement).src='/favicon.ico';}} 
              />
              <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-600">
                Create a new password for your wholesale account
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <h3 className="font-medium text-green-800">Password reset successful</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Your password has been updated. You'll be redirected to login shortly.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#25a18e] hover:bg-[#1e8a77]" 
                  disabled={isLoading || !token}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
            
            <div className="mt-8">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/login" className="text-[#25a18e] hover:text-[#1e8a77] font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Image and Testimonials */}
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
          <div className="h-full overflow-y-auto p-10 relative z-10">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-md">Account Security</h2>
              
              <Testimonial 
                name="Secure Access" 
                content="We take your account security seriously. Make sure to choose a strong, unique password that you don't use elsewhere."
              />
              
              <Testimonial 
                name="Data Protection" 
                content="All your business information and transaction history is protected with industry-standard encryption and security practices."
              />
              
              <Testimonial 
                name="Privacy First" 
                content="We never share your information with third parties without your explicit consent. Your business data remains yours."
                rating={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
