
import { useState } from 'react';
import { User } from '@/types/user';

export const useUserDialogs = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Initialize form data when a user is selected for editing
  const initEditFormData = (user: User) => {
    setEditFormData({
      business_name: user.business_name,
      business_type: user.business_type,
      business_address: user.business_address || '',
      phone: user.phone || '',
      email: user.email,
      payment_terms: user.payment_terms
    });
  };
  
  // Handle edit input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    editingUser,
    setEditingUser,
    editFormData,
    setEditFormData,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    userToDelete,
    setUserToDelete,
    isDeletingUser,
    setIsDeletingUser,
    initEditFormData,
    handleEditInputChange
  };
};
