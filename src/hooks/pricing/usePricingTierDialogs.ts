
import { useState } from 'react';
import { PricingTier } from '@/types/pricing';

export const usePricingTierDialogs = (
  onCreate: (tierData: Partial<PricingTier>) => Promise<PricingTier | null>,
  onUpdate: (id: string, tierData: Partial<PricingTier>) => Promise<boolean>,
  onDelete: (id: string) => Promise<boolean>
) => {
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

  return {
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
  };
};
