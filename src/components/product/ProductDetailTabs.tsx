
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AminoAcid, NutritionalValue } from '@/types/product';

interface ProductDetailTabsProps {
  description: string;
  ingredients?: string;
  aminoAcidProfile?: AminoAcid[] | null;
  nutritionalInfo?: NutritionalValue[] | null;
  servingSize?: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
  description,
  ingredients,
  aminoAcidProfile,
  nutritionalInfo,
  servingSize,
  activeTab,
  setActiveTab
}) => {
  return (
    <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="description">Description</TabsTrigger>
        {ingredients && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
        {aminoAcidProfile && aminoAcidProfile.length > 0 && (
          <TabsTrigger value="amino">Amino Acid Profile</TabsTrigger>
        )}
        {nutritionalInfo && nutritionalInfo.length > 0 && (
          <TabsTrigger value="nutritional">Nutritional Info</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="description" className="py-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-left">Description</h2>
            <p className="text-gray-700 text-left">{description}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      {ingredients && (
        <TabsContent value="ingredients" className="py-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-left">Ingredients</h2>
              <p className="text-gray-700 text-left">{ingredients}</p>
              
              <div className="mt-6">
                <p className="text-gray-700 mb-3 text-left">
                  Gluten Free | Dairy Free | Vegan Friendly | GMO Free | Halal and Kosher Certified
                </p>
                <div className="border border-green-600 rounded p-4 inline-flex items-center text-green-700">
                  <span className="font-medium text-left">
                    Produced in Australia from 90% Australian ingredients.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
      
      {aminoAcidProfile && aminoAcidProfile.length > 0 && (
        <TabsContent value="amino" className="py-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-left">Amino Acid Profile</h2>
              <p className="text-sm text-gray-500 mb-4 text-left">Total per serve ({servingSize || '30g'})</p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {aminoAcidProfile.map((amino, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-3 px-4 text-left">{amino.name}</td>
                        <td className="py-3 px-4 text-right">{amino.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
      
      {nutritionalInfo && nutritionalInfo.length > 0 && (
        <TabsContent value="nutritional" className="py-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-left">Nutritional Info</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4"></th>
                      <th className="text-right py-3 px-4">Per {servingSize || '30g'}</th>
                      <th className="text-right py-3 px-4">Per 100g</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionalInfo.map((info, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-3 px-4 text-left">{info.name}</td>
                        <td className="py-3 px-4 text-right">{info.perServing}</td>
                        <td className="py-3 px-4 text-right">{info.per100g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProductDetailTabs;
