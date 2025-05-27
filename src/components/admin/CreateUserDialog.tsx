
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
import { Checkbox } from '@/components/ui/checkbox';
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
  // Email options
  emailCredentials: z.boolean().default(false),
});

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  session: any;
}

// Generate a random temporary password
const generateTempPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

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

  const sendCredentialsEmail = async (email: string, tempPassword: string, businessName: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email,
          tempPassword,
          businessName,
        }
      });
      
      if (error) {
        console.error('Error sending credentials email:', error);
        throw error;
      }
      
      console.log('Credentials email sent successfully');
    } catch (error) {
      console.error('Failed to send credentials email:', error);
      throw error;
    }
  };

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

            {/* Email Credentials Option */}
            <FormField
              control={form.control}
              name="emailCredentials"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Email temporary password to retailer
                    </FormLabel>
                    <FormDescription>
                      Send login credentials with a temporary password. The retailer can reset their password after first login.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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
