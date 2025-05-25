
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
    <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 sm:mb-6 grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="description" className="text-xs sm:text-sm px-2 py-2">
          Description
        </TabsTrigger>
        {ingredients && (
          <TabsTrigger value="ingredients" className="text-xs sm:text-sm px-2 py-2">
            Ingredients
          </TabsTrigger>
        )}
        {aminoAcidProfile && aminoAcidProfile.length > 0 && (
          <TabsTrigger value="amino" className="text-xs sm:text-sm px-2 py-2">
            Amino Profile
          </TabsTrigger>
        )}
        {nutritionalInfo && nutritionalInfo.length > 0 && (
          <TabsTrigger value="nutritional" className="text-xs sm:text-sm px-2 py-2">
            Nutrition
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="description" className="py-2 sm:py-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-left">Description</h2>
            <p className="text-gray-700 text-left text-sm sm:text-base leading-relaxed">{description}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      {ingredients && (
        <TabsContent value="ingredients" className="py-2 sm:py-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-left">Ingredients</h2>
              <p className="text-gray-700 text-left text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">{ingredients}</p>
              
              <div className="mt-4 sm:mt-6">
                <p className="text-gray-700 mb-3 text-left text-sm sm:text-base">
                  Gluten Free | Dairy Free | Vegan Friendly | GMO Free | Halal and Kosher Certified
                </p>
                <div className="border border-green-600 rounded p-3 sm:p-4 inline-flex items-center text-green-700">
                  <span className="font-medium text-left text-sm sm:text-base">
                    Produced in Australia from 90% Australian ingredients.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
      
      {aminoAcidProfile && aminoAcidProfile.length > 0 && (
        <TabsContent value="amino" className="py-2 sm:py-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-left">Amino Acid Profile</h2>
              <p className="text-sm text-gray-500 mb-3 sm:mb-4 text-left">Total per serve ({servingSize || '30g'})</p>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px]">
                  <tbody>
                    {aminoAcidProfile.map((amino, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-left text-sm sm:text-base">{amino.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-sm sm:text-base">{amino.amount}</td>
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
        <TabsContent value="nutritional" className="py-2 sm:py-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-left">Nutritional Info</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base"></th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Per {servingSize || '30g'}</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Per 100g</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionalInfo.map((info, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-left text-sm sm:text-base">{info.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-sm sm:text-base">{info.perServing}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-sm sm:text-base">{info.per100g}</td>
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
