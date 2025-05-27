
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for user creation with shipping details
const userCreateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  role: z.enum(["admin", "retailer"]),
  // Contact details
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  // Shipping address
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(4, "Postal code must be at least 4 digits"),
});

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  session: any;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated,
  session 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      password: "",
      businessName: "",
      businessType: "",
      role: "retailer",
      contactName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof userCreateSchema>) => {
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
      
      // Create the auth user first using admin API
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          business_name: values.businessName,
          business_type: values.businessType,
          role: values.role,
          contact_name: values.contactName,
          phone: values.phone,
          address: `${values.street}, ${values.city}, ${values.state} ${values.postalCode}`
        }
      });
      
      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }
      
      if (!authData.user) {
        throw new Error('No user data returned from auth creation');
      }
      
      console.log('Auth user created successfully:', authData.user.id);
      
      // Now create/update the profile with the actual auth user ID
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id, // Use the actual auth user ID
          email: values.email,
          business_name: values.businessName,
          business_type: values.businessType,
          phone: values.phone,
          business_address: `${values.street}, ${values.city}, ${values.state} ${values.postalCode}`,
          approval_status: 'approved', // Auto-approve admin-created users
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id,
        }, {
          onConflict: 'id'
        });
      
      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }
      
      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: values.role
        });
      
      if (roleError) {
        console.error('Error adding role:', roleError);
        // Don't throw here as the user is created, just log the warning
        console.warn('User created but role assignment failed:', roleError.message);
      }
      
      toast({
        title: "User created successfully",
        description: `${values.businessName} (${values.email}) has been added and approved.`,
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Retailer</DialogTitle>
          <DialogDescription>
            Add a new wholesale retailer to the platform with complete contact and shipping details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Business Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Nutrition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Retail Store">Retail Store</SelectItem>
                        <SelectItem value="Online Shop">Online Shop</SelectItem>
                        <SelectItem value="Gym">Gym</SelectItem>
                        <SelectItem value="Health Food Store">Health Food Store</SelectItem>
                        <SelectItem value="Supplement Shop">Supplement Shop</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="04XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Login Credentials */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="business@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shipping Address */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Business Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Sydney" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NSW">NSW</SelectItem>
                        <SelectItem value="VIC">VIC</SelectItem>
                        <SelectItem value="QLD">QLD</SelectItem>
                        <SelectItem value="WA">WA</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="TAS">TAS</SelectItem>
                        <SelectItem value="ACT">ACT</SelectItem>
                        <SelectItem value="NT">NT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create Retailer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
