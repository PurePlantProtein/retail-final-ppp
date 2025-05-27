
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import BusinessInfoFields from './users/createUser/BusinessInfoFields';
import ContactInfoFields from './users/createUser/ContactInfoFields';
import LoginCredentialsFields from './users/createUser/LoginCredentialsFields';
import AddressFields from './users/createUser/AddressFields';
import RoleField from './users/createUser/RoleField';
import { useCreateUser } from './users/createUser/useCreateUser';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  session: any;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated,
  session 
}) => {
  const { form, isSubmitting, onSubmit } = useCreateUser(onUserCreated, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Retailer</DialogTitle>
          <DialogDescription>
            Add a new wholesale retailer to the platform with complete contact and shipping details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Business Information */}
            <BusinessInfoFields control={form.control} />

            {/* Contact Information */}
            <ContactInfoFields control={form.control} />

            {/* Login Credentials */}
            <LoginCredentialsFields control={form.control} />

            {/* Shipping Address */}
            <AddressFields control={form.control} />
            
            <RoleField control={form.control} />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create Retailer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
