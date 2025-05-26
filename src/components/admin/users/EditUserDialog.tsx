
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

interface PricingTier {
  id: string;
  name: string;
  description: string;
}

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    business_address: '',
    phone: '',
    payment_terms: 14,
    role: '',
    pricing_tier_id: 'no-tier' // Use placeholder value instead of empty string
  });

  useEffect(() => {
    if (user) {
      setFormData({
        business_name: user.business_name || '',
        business_type: user.business_type || '',
        business_address: user.business_address || '',
        phone: user.phone || '',
        payment_terms: user.payment_terms || 14,
        role: user.roles[0] || '',
        pricing_tier_id: user.pricing_tier_id || 'no-tier' // Use placeholder value
      });
    }
    loadPricingTiers();
  }, [user]);

  const loadPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPricingTiers(data || []);
    } catch (error) {
      console.error('Error loading pricing tiers:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          business_name: formData.business_name,
          business_type: formData.business_type,
          business_address: formData.business_address,
          phone: formData.phone,
          payment_terms: formData.payment_terms
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      if (formData.role && formData.role !== user.roles[0]) {
        // Validate role
        const validRoles = ['admin', 'retailer'];
        if (!validRoles.includes(formData.role)) {
          throw new Error('Invalid role specified');
        }

        // Delete existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: formData.role as 'admin' | 'retailer'
          });

        if (roleError) throw roleError;
      }

      // Update pricing tier if changed
      const currentTierId = user.pricing_tier_id || 'no-tier';
      if (formData.pricing_tier_id !== currentTierId) {
        // Delete existing pricing tier assignment
        await supabase
          .from('user_pricing_tiers')
          .delete()
          .eq('user_id', user.id);

        // Insert new pricing tier if one is selected (not the placeholder)
        if (formData.pricing_tier_id && formData.pricing_tier_id !== 'no-tier') {
          const { error: tierError } = await supabase
            .from('user_pricing_tiers')
            .insert({
              user_id: user.id,
              tier_id: formData.pricing_tier_id
            });

          if (tierError) throw tierError;
        }
      }

      toast({
        title: "Success",
        description: "User has been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <div className="col-span-3 py-2 text-sm text-gray-600">
              {user.email}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_name" className="text-right">
              Business Name
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_type" className="text-right">
              Business Type
            </Label>
            <Input
              id="business_type"
              value={formData.business_type}
              onChange={(e) => handleInputChange('business_type', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_address" className="text-right">
              Address
            </Label>
            <Input
              id="business_address"
              value={formData.business_address}
              onChange={(e) => handleInputChange('business_address', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_terms" className="text-right">
              Payment Terms
            </Label>
            <Input
              id="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="retailer">Retailer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pricing_tier" className="text-right">
              Pricing Tier
            </Label>
            <Select 
              value={formData.pricing_tier_id} 
              onValueChange={(value) => handleInputChange('pricing_tier_id', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select pricing tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-tier">No tier assigned</SelectItem>
                {pricingTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name} - {tier.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
