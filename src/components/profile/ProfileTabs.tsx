
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from './ProfileForm';
import ShippingAddressCard from './ShippingAddressCard';
import { UserProfile } from '@/types/auth';

type ProfileTabsProps = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  user: any;
  profile: UserProfile | null;
  isSubmitting: boolean;
  refreshProfile: () => Promise<void>;
  shippingAddress: any;
  handleShippingFormSubmit: (data: any) => void;
};

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
  user,
  profile,
  isSubmitting,
  refreshProfile,
  shippingAddress,
  handleShippingFormSubmit,
}) => {
  return (
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
        <ProfileForm 
          user={user}
          profile={profile}
          isSubmitting={isSubmitting}
          refreshProfile={refreshProfile}
        />
      </TabsContent>
      
      <TabsContent value="shipping">
        <ShippingAddressCard
          shippingAddress={shippingAddress}
          onSubmit={handleShippingFormSubmit}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
