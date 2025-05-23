
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  business_name: z.string().min(2, {
    message: "Business name must be at least 2 characters."
  }),
  business_address: z.string().optional(),
  phone: z.string().optional(),
  business_type: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const businessTypes = [
  "Gym",
  "Health Store",
  "Online Store",
  "Nutrition Shop",
  "Fitness Center",
  "Pharmacy",
  "Other"
];

type ProfileFormProps = {
  user: any;
  profile: UserProfile | null;
  isSubmitting: boolean;
  refreshProfile: () => Promise<void>;
};

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  user, 
  profile, 
  isSubmitting, 
  refreshProfile 
}) => {
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: profile?.business_name || '',
      business_address: profile?.business_address || '',
      phone: profile?.phone || '',
      business_type: profile?.business_type || '',
    },
  });
  
  React.useEffect(() => {
    if (user && profile) {
      form.reset({
        business_name: profile.business_name || '',
        business_address: profile.business_address || '',
        phone: profile.phone || '',
        business_type: profile.business_type || '',
      });
    }
  }, [user, profile, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updateData = {
        business_name: data.business_name,
        business_address: data.business_address,
        phone: data.phone,
        business_type: data.business_type,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          ...updateData
        }, { 
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Business Profile</CardTitle>
        <CardDescription>
          Manage your business information for wholesale purchasing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Business Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of business you operate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="business_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Business St, City, State, ZIP" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your business shipping address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-[#25a18e] hover:bg-[#1e8a77]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col border-t pt-6 space-y-2">
        <div className="w-full flex justify-between">
          <p className="text-sm text-gray-500">Account Email:</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <div className="w-full flex justify-between">
          <p className="text-sm text-gray-500">Payment Terms:</p>
          <p className="text-sm font-medium">{profile?.payment_terms || 14} days</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
