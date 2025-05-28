
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

  const createAuthUser = async (email: string, tempPassword: string) => {
    try {
      // Use the admin auth API to create a user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email for admin-created users
      });

      if (error) {
        console.error('Error creating auth user:', error);
        throw new Error(`Failed to create auth user: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user returned from auth creation');
      }

      console.log('Auth user created successfully:', data.user.id);
      return data.user;
    } catch (error) {
      console.error('Error in createAuthUser:', error);
      throw error;
    }
  };

  const createUserProfile = async (userId: string, values: UserCreateFormData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: values.email,
          business_name: values.businessName,
          business_type: values.businessType,
          phone: values.phone,
          business_address: `${values.street}, ${values.city}, ${values.state} ${values.postalCode}`,
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id,
        });

      if (error) {
        console.error('Error creating profile:', error);
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      console.log('Profile created successfully for user:', userId);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const assignUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error('Error adding role:', error);
        // Don't throw here - role assignment failure shouldn't break the whole process
        console.warn('User created but role assignment failed:', error.message);
      } else {
        console.log('Role assigned successfully:', role);
      }
    } catch (error) {
      console.error('Error in assignUserRole:', error);
      // Don't throw - role assignment failure shouldn't break the whole process
    }
  };

  const cleanupOnError = async (userId?: string) => {
    if (userId) {
      try {
        // Clean up profile if it was created
        await supabase.from('profiles').delete().eq('id', userId);
        // Clean up user roles if they were created
        await supabase.from('user_roles').delete().eq('user_id', userId);
        // Delete the auth user
        await supabase.auth.admin.deleteUser(userId);
        console.log('Cleaned up user after error:', userId);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
  };

  const onSubmit = async (values: UserCreateFormData) => {
    setIsSubmitting(true);
    let createdUserId: string | undefined;
    
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
        return;
      }
      
      // Generate temporary password
      const tempPassword = values.emailCredentials ? generateTempPassword() : 'TempPass123!';
      
      console.log('Starting user creation process...');
      
      // Step 1: Create auth user
      const authUser = await createAuthUser(values.email, tempPassword);
      createdUserId = authUser.id;
      
      // Step 2: Create profile using the auth user's ID
      await createUserProfile(authUser.id, values);
      
      // Step 3: Assign user role
      await assignUserRole(authUser.id, values.role);
      
      // Step 4: Send credentials email if requested
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
      
      // Cleanup on error
      await cleanupOnError(createdUserId);
      
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
