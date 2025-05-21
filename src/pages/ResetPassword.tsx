
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract the hash parameters on component mount
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setHashParams(new URLSearchParams(hash));
    } else {
      toast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Basic validation
    if (!password) {
      setErrorMessage("Please enter a new password");
      return;
    }
    
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "You can now login with your new password",
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#212529] dark:to-[#343a40] border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-[#212529] dark:text-white">Reset Password</CardTitle>
            <CardDescription className="text-[#495057] dark:text-[#adb5bd]">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          {!hashParams ? (
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-100 text-red-800 rounded-md">
                <p className="font-medium">Invalid or expired link</p>
                <p className="text-sm mt-2">Please request a new password reset link from the forgot password page.</p>
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  className="w-full mt-4 bg-[#25a18e] hover:bg-[#1e8a77] text-white transition-all"
                >
                  Go to Forgot Password
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#343a40] dark:text-[#f8f9fa]">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border-[#ced4da] dark:bg-[#495057] dark:border-[#6c757d] focus-visible:ring-[#25a18e]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#343a40] dark:text-[#f8f9fa]">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white border-[#ced4da] dark:bg-[#495057] dark:border-[#6c757d] focus-visible:ring-[#25a18e]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-[#25a18e] hover:bg-[#1e8a77] text-white transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating Password..." : "Reset Password"}
                </Button>
              </CardContent>
            </form>
          )}
          <CardFooter className="flex justify-center">
            <p className="text-sm text-[#6c757d] dark:text-[#adb5bd]">
              Remember your password?{" "}
              <a href="/login" className="text-[#25a18e] hover:text-[#1e8a77] hover:underline">
                Login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
