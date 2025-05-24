
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { PricingTier } from '@/types/pricing';

interface PricingTiersTableProps {
  tiers: PricingTier[];
  isLoading: boolean;
  onCreate: (tierData: Partial<PricingTier>) => Promise<PricingTier | null>;
  onUpdate: (id: string, tierData: Partial<PricingTier>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const PricingTiersTable: React.FC<PricingTiersTableProps> = ({
  tiers,
  isLoading,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState<Partial<PricingTier>>({
    name: '',
    description: '',
    discount_percentage: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount_percentage' ? parseFloat(value) : value
    }));
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      discount_percentage: 0
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (tier: PricingTier) => {
    setSelectedTier(tier);
    setFormData({
      name: tier.name,
      description: tier.description,
      discount_percentage: tier.discount_percentage
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (tier: PricingTier) => {
    setSelectedTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    const result = await onCreate(formData);
    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTier) return;
    const result = await onUpdate(selectedTier.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTier) return;
    const result = await onDelete(selectedTier.id);
    if (result) {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading pricing tiers...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Pricing Tiers</h3>
        <Button onClick={handleCreateClick}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Tier
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of pricing tiers in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No pricing tiers found. Create your first tier.
                </TableCell>
              </TableRow>
            ) : (
              tiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>{tier.description}</TableCell>
                  <TableCell>{tier.discount_percentage}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(tier)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(tier)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Pricing Tier</DialogTitle>
            <DialogDescription>
              Create a new pricing tier for your users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount_percentage" className="text-right">
                Discount %
              </Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                value={formData.discount_percentage || 0}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pricing Tier</DialogTitle>
            <DialogDescription>
              Make changes to the pricing tier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-discount" className="text-right">
                Discount %
              </Label>
              <Input
                id="edit-discount"
                name="discount_percentage"
                type="number"
                value={formData.discount_percentage || 0}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Pricing Tier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pricing tier?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingTiersTable;
