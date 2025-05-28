
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { userCreateSchema, UserCreateFormData } from './userCreateSchema';

export const useCreateUser = (onUserCreated: () => void, onClose: () => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  const form = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      businessName: "",
      businessType: "",
      role: "retailer",
      contactName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      emailCredentials: false,
    },
  });

  const onSubmit = async (values: UserCreateFormData) => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create users.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Calling create-user edge function...');
      
      // Call the edge function to create the user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: values.email,
          businessName: values.businessName,
          businessType: values.businessType,
          role: values.role,
          contactName: values.contactName,
          phone: values.phone,
          street: values.street,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          emailCredentials: values.emailCredentials,
          currentUserId: currentUser.id,
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(error.message || 'Failed to create user');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('User created successfully via edge function');

      toast({
        title: "User created successfully",
        description: data?.message || `${values.businessName} has been added successfully.`,
      });
      
      form.reset();
      onUserCreated();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      toast({
        title: "Failed to create user",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit
  };
};
