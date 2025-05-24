
import React from 'react';
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
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { PricingTier } from '@/types/pricing';
import { usePricingTierDialogs } from '@/hooks/pricing/usePricingTierDialogs';
import CreatePricingTierDialog from './dialogs/CreatePricingTierDialog';
import EditPricingTierDialog from './dialogs/EditPricingTierDialog';
import DeletePricingTierDialog from './dialogs/DeletePricingTierDialog';

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
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedTier,
    formData,
    handleInputChange,
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteSubmit
  } = usePricingTierDialogs(onCreate, onUpdate, onDelete);

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

      {/* Dialog Components */}
      <CreatePricingTierDialog 
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleCreateSubmit}
      />

      <EditPricingTierDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleEditSubmit}
      />

      <DeletePricingTierDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        selectedTier={selectedTier}
        handleSubmit={handleDeleteSubmit}
      />
    </div>
  );
};

export default PricingTiersTable;
