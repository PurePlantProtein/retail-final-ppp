
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordButtonProps {
  userEmail: string;
  userName: string;
}

const ResetPasswordButton: React.FC<ResetPasswordButtonProps> = ({ 
  userEmail, 
  userName 
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    setIsResetting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset sent",
        description: `A password reset link has been sent to ${userEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error sending reset email",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResetPassword}
      disabled={isResetting}
      className="flex items-center gap-2"
    >
      {isResetting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      Reset Password
    </Button>
  );
};

export default ResetPasswordButton;
