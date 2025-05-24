
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PricingTiersTable from '@/components/admin/pricing/PricingTiersTable';
import { usePricingTiers } from '@/hooks/usePricingTiers';

const PricingTiersManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    tiers,
    isLoading,
    createPricingTier,
    updatePricingTier,
    deletePricingTier
  } = usePricingTiers();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
  }, [user, isAdmin, navigate, toast]);

  if (!isAdmin) return null;

  return (
    <Layout>
      <AdminLayout>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Pricing Tiers Management</h1>
          
          <Card className="mb-8">
            <CardHeader className="text-left">
              <CardTitle>Pricing Tiers</CardTitle>
              <CardDescription>
                Create and manage pricing tiers for different user categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingTiersTable
                tiers={tiers}
                isLoading={isLoading}
                onCreate={createPricingTier}
                onUpdate={updatePricingTier}
                onDelete={deletePricingTier}
              />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default PricingTiersManagement;
