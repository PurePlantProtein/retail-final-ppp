
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PricingTier } from '@/types/pricing';
import { usePricingTierDialogs } from '@/hooks/pricing/usePricingTierDialogs';
import CreatePricingTierDialog from './dialogs/CreatePricingTierDialog';
import EditPricingTierDialog from './dialogs/EditPricingTierDialog';
import DeletePricingTierDialog from './dialogs/DeletePricingTierDialog';
import TiersTable from './TiersTable';

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

      <TiersTable 
        tiers={tiers}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

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
