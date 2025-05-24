
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/components/admin/UsersTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePricingTiers } from '@/hooks/usePricingTiers';

interface EditUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingUser: User | null;
  editFormData: Partial<User>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: () => Promise<void>;
  onPricingTierChange?: (tierId: string) => Promise<boolean | void>;
  currentPricingTierId?: string | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  setIsOpen,
  editingUser,
  editFormData,
  onInputChange,
  onFormSubmit,
  onPricingTierChange,
  currentPricingTierId
}) => {
  const { tiers, isLoading: loadingTiers } = usePricingTiers();
  const [selectedTierId, setSelectedTierId] = useState<string | undefined>(
    currentPricingTierId || undefined
  );

  // Update selected tier when currentPricingTierId changes
  useEffect(() => {
    setSelectedTierId(currentPricingTierId || undefined);
  }, [currentPricingTierId]);

  const handleTierChange = async (value: string) => {
    setSelectedTierId(value);
    if (onPricingTierChange) {
      await onPricingTierChange(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              value={editFormData.email || ''}
              onChange={onInputChange}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_name" className="text-right">
              Business Name
            </Label>
            <Input
              id="business_name"
              name="business_name"
              value={editFormData.business_name || ''}
              onChange={onInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_type" className="text-right">
              Business Type
            </Label>
            <Input
              id="business_type"
              name="business_type"
              value={editFormData.business_type || ''}
              onChange={onInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={editFormData.phone || ''}
              onChange={onInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_terms" className="text-right">
              Payment Terms
            </Label>
            <Input
              id="payment_terms"
              name="payment_terms"
              type="number"
              value={editFormData.payment_terms || 14}
              onChange={onInputChange}
              className="col-span-3"
              min="0"
              placeholder="Days (e.g. 14)"
            />
          </div>
          {onPricingTierChange && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricing_tier" className="text-right">
                Pricing Tier
              </Label>
              <Select
                value={selectedTierId}
                onValueChange={handleTierChange}
                disabled={loadingTiers}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pricing tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default (No special pricing)</SelectItem>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} ({tier.discount_percentage}% discount)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="business_address" className="text-right">
              Address
            </Label>
            <Textarea
              id="business_address"
              name="business_address"
              value={editFormData.business_address || ''}
              onChange={onInputChange}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onFormSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
