
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the current hostname and protocol for the redirect URL
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/reset-password`;
      
      console.log("Sending password reset with redirect to:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the password reset link",
      });
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send password reset email");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#212529] dark:to-[#343a40] border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-[#212529] dark:text-white">Forgot Password</CardTitle>
            <CardDescription className="text-[#495057] dark:text-[#adb5bd]">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              
              {isSuccess ? (
                <div className="p-4 bg-[#25a18e]/20 text-[#25a18e] rounded-md text-center">
                  <p className="font-medium">Password reset email sent!</p>
                  <p className="text-sm mt-2">Please check your inbox for the password reset link.</p>
                </div>
              ) : (
                <div className="space-y-4">
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
                  <Button 
                    type="submit" 
                    className="w-full bg-[#25a18e] hover:bg-[#1e8a77] text-white transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              )}
            </CardContent>
          </form>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-[#6c757d] dark:text-[#adb5bd]">
              Remember your password?{" "}
              <Link to="/login" className="text-[#25a18e] hover:text-[#1e8a77] hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
