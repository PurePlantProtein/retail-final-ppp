
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, FileImage, FileSpreadsheet, File } from 'lucide-react';
import { MarketingMaterial } from '@/types/product';
import { getMarketingMaterials } from '@/services/marketingService';
import { Skeleton } from '@/components/ui/skeleton';

const Marketing = () => {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const data = await getMarketingMaterials();
        setMaterials(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(data.map(item => item.category || 'General'))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching marketing materials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);
  
  // Filter materials based on active tab
  const filteredMaterials = activeTab === 'All' 
    ? materials 
    : materials.filter(material => material.category === activeTab);
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileImage className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <File className="h-6 w-6" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marketing Materials</h1>
          <p className="text-gray-600">
            Download promotional materials for Pure Plant Protein products.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap w-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getFileIcon(material.file_type)}
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                      </div>
                      {material.category && (
                        <span className="text-sm text-gray-500">{material.category}</span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{material.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-xl font-medium text-gray-700 mb-1">No marketing materials found</h3>
                <p className="text-gray-500">
                  There are no marketing materials available in this category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Marketing;
