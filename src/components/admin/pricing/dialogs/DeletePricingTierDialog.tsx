
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingTier } from '@/types/pricing';

interface DeletePricingTierDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTier: PricingTier | null;
  handleSubmit: () => Promise<void>;
}

const DeletePricingTierDialog: React.FC<DeletePricingTierDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedTier,
  handleSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Pricing Tier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this pricing tier?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {selectedTier && (
          <div className="py-4 space-y-2">
            <p><strong>Name:</strong> {selectedTier.name}</p>
            <p><strong>Discount:</strong> {selectedTier.discount_percentage}%</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePricingTierDialog;
