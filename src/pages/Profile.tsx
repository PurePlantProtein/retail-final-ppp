
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useShipping } from '@/contexts/ShippingContext';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import ProfileTabs from '@/components/profile/ProfileTabs';

const Profile = () => {
  const { user, profile: authProfile, isLoading, refreshProfile } = useAuth();
  const { shippingAddress, setShippingAddress } = useShipping();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

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
        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          profile={authProfile}
          isSubmitting={isSubmitting}
          refreshProfile={refreshProfile}
          shippingAddress={shippingAddress}
          handleShippingFormSubmit={handleShippingFormSubmit}
        />
      </div>
    </Layout>
  );
};

export default Profile;
