
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { userCreateSchema, UserCreateFormData } from './userCreateSchema';
import { generateTempPassword, sendCredentialsEmail } from './credentialsEmailService';

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
    setIsSubmitting(true);
    
    try {
      // Check if user already exists in profiles table
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();
      
      if (existingProfile) {
        toast({
          title: "User already exists",
          description: `A user with the email ${values.email} already exists.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Generate temporary password if emailing credentials
      const tempPassword = values.emailCredentials ? generateTempPassword() : 'TempPass123!';
      
      console.log('Creating profile and role...');
      
      // Create profile first with a generated UUID
      const userId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: values.email,
          business_name: values.businessName,
          business_type: values.businessType,
          phone: values.phone,
          business_address: `${values.street}, ${values.city}, ${values.state} ${values.postalCode}`,
          approval_status: 'approved', // Auto-approve admin-created users
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id,
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }
      
      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: values.role
        });
      
      if (roleError) {
        console.error('Error adding role:', roleError);
        console.warn('User profile created but role assignment failed:', roleError.message);
      }
      
      // Send credentials email if requested
      if (values.emailCredentials) {
        try {
          await sendCredentialsEmail(values.email, tempPassword, values.businessName);
          toast({
            title: "User created successfully",
            description: `${values.businessName} has been added and login credentials have been emailed to ${values.email}.`,
          });
        } catch (emailError) {
          toast({
            title: "User created with warning",
            description: `${values.businessName} has been added but failed to send credentials email. Please provide login details manually.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "User created successfully",
          description: `${values.businessName} (${values.email}) has been added and approved.`,
        });
      }
      
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
