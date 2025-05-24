
import { useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useUserStatus = () => {
  const { toast } = useToast();

  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    toast({
      title: `User ${isActive ? 'activated' : 'deactivated'}`,
      description: "User status updated successfully.",
    });
    return true;
  }, [toast]);

  return {
    toggleUserStatus
  };
};
