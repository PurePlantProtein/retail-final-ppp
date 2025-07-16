import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBusinessTypes } from '@/hooks/users/useBusinessTypes';
import { BusinessType } from '@/types/user';

const BusinessTypesManagement = () => {
  const [newBusinessTypeName, setNewBusinessTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const {
    businessTypes,
    loading,
    error,
    addBusinessType,
    deleteBusinessType,
  } = useBusinessTypes();

  const handleAddBusinessType = async () => {
    if (!newBusinessTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Business type name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    if (businessTypes.some((bt: BusinessType) => bt.name.toLowerCase() === newBusinessTypeName.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Business type already exists',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addBusinessType(newBusinessTypeName);
      toast({
        title: 'Success',
        description: `Business type "${newBusinessTypeName}" has been added.`,
      });
      setNewBusinessTypeName('');
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to add business type',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setAddDialogOpen(false);
    }
  };

  const handleDeletePrompt = (bt: BusinessType) => {
    setTypeToDelete(bt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBusinessType = async () => {
    if (!typeToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteBusinessType(typeToDelete.id);
      toast({
        title: 'Success',
        description: `Business type "${typeToDelete.name}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to delete business type',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Business Types Management</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add New Type
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Business Type</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="business-type-name">Business Type Name</Label>
                  <Input
                    id="business-type-name"
                    value={newBusinessTypeName}
                    onChange={(e) => setNewBusinessTypeName(e.target.value)}
                    placeholder="Enter business type name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBusinessType} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Type'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">Loading business types...</div>
        ) : businessTypes.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">No Business Types Found</h3>
            <p className="text-gray-500 mb-4">Create your first business type to organize your users.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Your First Business Type</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Business Type</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="business-type-name-empty">Business Type Name</Label>
                    <Input
                      id="business-type-name-empty"
                      value={newBusinessTypeName}
                      onChange={(e) => setNewBusinessTypeName(e.target.value)}
                      placeholder="Enter business type name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBusinessType} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Type'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {businessTypes.map((bt: BusinessType) => (
              <Card key={bt.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-md font-medium">
                    {bt.name.charAt(0).toUpperCase() + bt.name.slice(1)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeletePrompt(bt)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the business type "{typeToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBusinessType}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BusinessTypesManagement;
