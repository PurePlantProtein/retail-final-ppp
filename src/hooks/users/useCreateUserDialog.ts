
import { useState } from 'react';

export const useCreateUserDialog = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  return {
    isCreateUserDialogOpen,
    setIsCreateUserDialogOpen
  };
};
