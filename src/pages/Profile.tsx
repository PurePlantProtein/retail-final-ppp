
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useShipping } from '@/contexts/ShippingContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShippingForm from '@/components/ShippingForm';

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

const Profile = () => {
  const { user, profile: authProfile, isLoading, refreshProfile } = useAuth();
  const { shippingAddress, setShippingAddress } = useShipping();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: '',
      business_address: '',
      phone: '',
      business_type: '',
    },
  });
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Fetch profile data
  useEffect(() => {
    if (user && authProfile) {
      console.log("Setting form values from profile:", authProfile);
      
      form.reset({
        business_name: authProfile.business_name || '',
        business_address: authProfile.business_address || '',
        phone: authProfile.phone || '',
        business_type: authProfile.business_type || '',
      });
    }
  }, [user, authProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting profile update:", data);
    
    try {
      const updateData = {
        business_name: data.business_name,
        business_address: data.business_address,
        phone: data.phone,
        business_type: data.business_type,
        updated_at: new Date().toISOString(),
      };
      
      console.log("Updating profile with data:", updateData);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          ...updateData
        }, { 
          onConflict: 'id'
        });

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      // Use the refreshProfile method from AuthContext to update the local state
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingFormSubmit = async (shippingData: any) => {
    setShippingAddress(shippingData);
    
    // Also save the business address to the profile if it's not already set
    if (user && (!authProfile?.business_address || authProfile.business_address === '')) {
      try {
        const addressString = `${shippingData.street}, ${shippingData.city}, ${shippingData.state} ${shippingData.postalCode}`;
        
        const { error } = await supabase
          .from('profiles')
          .update({
            business_address: addressString,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        
        // Refresh profile after updating
        await refreshProfile();
      } catch (error) {
        console.error("Error updating business address:", error);
      }
    }
    
    toast({
      title: "Shipping address updated",
      description: "Your default shipping address has been successfully updated.",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
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
              <CardFooter className="flex justify-between border-t pt-6">
                <div>
                  <p className="text-sm text-gray-500">Account Email: {user.email}</p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Default Shipping Address</CardTitle>
                <CardDescription>
                  Manage your default shipping address for faster checkout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShippingForm 
                  onSubmit={handleShippingFormSubmit} 
                  defaultValues={shippingAddress || undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
