
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { MarketingMaterial } from '@/types/product';
import { 
  Plus, 
  FileText, 
  File, 
  FileImage,
  FileSpreadsheet,
  Trash,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { 
  getMarketingMaterials, 
  uploadMarketingMaterial,
  deleteMarketingMaterial
} from '@/services/marketingService';
import { Alert, AlertDescription } from '@/components/ui/alert';

type FormValues = {
  title: string;
  description: string;
  category: string;
  file: FileList;
};

const MarketingMaterialsManagement = () => {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [categories, setCategories] = useState<string[]>(['General', 'Flyers', 'Brochures', 'Logos', 'Promotional']);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
    },
  });
  
  useEffect(() => {
    fetchMaterials();
  }, []);
  
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMarketingMaterials();
      setMaterials(data);
      
      // Extract unique categories from the fetched materials
      const uniqueCategories = [...new Set(data.map(item => item.category || 'General'))];
      setCategories(prev => {
        const merged = [...prev, ...uniqueCategories];
        return [...new Set(merged)]; // Remove duplicates
      });
    } catch (error) {
      console.error('Error fetching marketing materials:', error);
      setError('Failed to load marketing materials. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load marketing materials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteMarketingMaterial(id);
      // Update the local state to reflect the change immediately
      setMaterials(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Marketing material deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete marketing material',
        variant: 'destructive',
      });
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      const newMaterial = await uploadMarketingMaterial(selectedFile, {
        title: data.title,
        description: data.description,
        category: data.category,
        file_type: selectedFile.type,
      });
      
      // Update the local state to add the new material immediately
      setMaterials(prev => [newMaterial, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Marketing material uploaded successfully',
      });
      
      form.reset();
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error uploading marketing material:', error);
      setError('Failed to upload marketing material. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to upload marketing material',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileImage className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <File className="h-6 w-6" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };
  
  return (
    <Layout>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Marketing Materials</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Marketing Material</DialogTitle>
                  <DialogDescription>
                    Add promotional materials for retailers to use.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: 'Title is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Product Brochure" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      rules={{ required: 'Description is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe this marketing material..." 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="file" 
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-gray-500">
                          Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </p>
                      )}
                    </FormItem>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : materials.length === 0 ? (
            <Card className="w-full p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No marketing materials yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload promotional materials for retailers to use.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Material
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(material.file_type)}
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                      </div>
                    </div>
                    {material.category && (
                      <div className="text-sm text-gray-500">{material.category}</div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm">{material.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default MarketingMaterialsManagement;
