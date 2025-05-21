
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';

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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      
      toast({
        title: "Success",
        description: "Password reset link sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link",
        variant: "destructive",
      });
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
              />
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-gray-600">
                Enter your email and we'll send you instructions to reset your password
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <h3 className="font-medium text-green-800">Password reset email sent</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Check your inbox for instructions to reset your password. If you don't see it, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@yourbusiness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#25a18e] hover:bg-[#1e8a77]" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
            
            <div className="mt-8">
              <Link to="/login" className="inline-flex items-center text-sm text-[#25a18e] hover:text-[#1e8a77] font-medium">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right side - Image and Testimonials */}
        <div className="hidden md:block md:w-[55%] bg-gradient-to-br from-[#f8f9fa] to-[#e2d1c3] relative">
          <div className="absolute inset-0 bg-[#25a18e]/10"></div>
          <div className="h-full overflow-y-auto p-10 relative z-10">
            <div className="max-w-lg mx-auto">
              <img 
                src="https://ppprotein.com.au/cdn/shop/products/collagen-coffee-creamer-350g-pp-protein-414141_1000x.jpg?v=1647926202" 
                alt="PP Protein Products" 
                className="w-full h-64 object-cover rounded-xl mb-8" 
              />
              
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Support</h2>
              
              <Testimonial 
                name="Fast Support" 
                content="Our team is available to help with any questions or issues you may have with your wholesale account."
              />
              
              <Testimonial 
                name="Secure Access" 
                content="Your account security is important to us. We implement industry-standard security measures to protect your information."
              />
              
              <Testimonial 
                name="Need more help?" 
                content="Contact our wholesale support team directly at wholesale@ppprotein.com.au or call us at (02) 8123-4567."
                rating={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
