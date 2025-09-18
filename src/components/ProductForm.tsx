import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/product';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createProduct, updateProduct, getCategories, addCategory } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Plus, Minus, Weight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from '@/components/ImageUploader';
import type { Product, AminoAcid, NutritionalValue } from '@/types/product';

const aminoAcidSchema = z.object({
  name: z.string(),
  amount: z.string()
});

const nutritionalValueSchema = z.object({
  name: z.string(),
  perServing: z.string(),
  per100g: z.string()
});

const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  minQuantity: z.coerce.number().int().positive({ message: "Minimum quantity must be a positive integer" }).default(12),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
  // Allow absolute or relative URLs for images
  image: z.string().refine((v) => {
    if (!v) return false;
    // Accept http(s):// or starting with / (served by our API)
    return /^https?:\/\//i.test(v) || v.startsWith('/');
  }, { message: 'Image must be a valid URL' }),
  category: z.string().min(1, { message: "Please select a category" }),
  sku: z.string().min(1, { message: 'SKU is required' }).optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  // Ensure weight is properly validated as a number
  weight: z.coerce.number().nonnegative({ message: "Weight must be a non-negative number" }).optional(),
  servingSize: z.string().optional(),
  numberOfServings: z.coerce.number().int().nonnegative().optional(),
  bagSize: z.string().optional(),
  ingredients: z.string().optional(),
  aminoAcidProfile: z.array(aminoAcidSchema).optional(),
  nutritionalInfo: z.array(nutritionalValueSchema).optional()
});

type ProductFormProps = {
  product?: Product;
  onSuccess?: (product: Product) => void;
};

const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Amino Acid Profile state
  const [aminoAcids, setAminoAcids] = useState<AminoAcid[]>(
    product?.aminoAcidProfile || [
      { name: 'Alanine', amount: '' },
      { name: 'Arginine', amount: '' },
      { name: 'Aspartic acid', amount: '' },
      { name: 'Cystine', amount: '' },
      { name: 'Glutamic acid', amount: '' },
      { name: 'Glycine', amount: '' }
    ]
  );
  
  // Nutritional Info state
  const [nutritionalValues, setNutritionalValues] = useState<NutritionalValue[]>(
    product?.nutritionalInfo || [
      { name: 'Energy', perServing: '', per100g: '' },
      { name: 'Protein', perServing: '', per100g: '' },
      { name: 'Fat Total', perServing: '', per100g: '' },
      { name: 'Carbohydrate', perServing: '', per100g: '' }
    ]
  );

  // Fetch available categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      // Ensure numeric default to satisfy form typing expecting number
      price: typeof product.price === 'number' ? product.price : (parseFloat(product.price as any) || 0),
      minQuantity: product.minQuantity || 12, // Default to 12 as per MOQ requirement
      stock: product.stock,
      image: product.image,
      category: (product.category?.id ?? '').toString(),
      sku: product.sku || '',
      // New fields
      weight: product.weight || 0,
      servingSize: product.servingSize || '',
      numberOfServings: product.numberOfServings || 0,
      bagSize: product.bagSize || '',
      ingredients: product.ingredients || '',
      aminoAcidProfile: product.aminoAcidProfile || [],
      nutritionalInfo: product.nutritionalInfo || []
    } : {
      name: '',
      description: '',
      price: 0,
      minQuantity: 12, // Default to 12 as per MOQ requirement
      stock: 0,
      image: '',
      category: '',
      sku: '',
      // New fields
      weight: 0,
      servingSize: '',
      numberOfServings: 0,
      bagSize: '',
      ingredients: '',
      aminoAcidProfile: [],
      nutritionalInfo: []
    },
  });

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    // Include amino acid profile and nutritional info
    const formData = {
      ...data,
      price: typeof data.price === 'number' ? data.price.toString() : data.price,
      aminoAcidProfile: aminoAcids,
      nutritionalInfo: nutritionalValues
    };
    
    try {
      if (product) {
        // Update existing product
        const updatedProduct = await updateProduct(product.id, formData);
        toast({
          title: "Success",
          description: `Product "${data.name}" has been updated.`,
        });
        onSuccess?.(updatedProduct);
      } else {
        // Create new product - Ensure all required fields are provided
        const newProductData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          minQuantity: formData.minQuantity || 12, // Default to 12 as per MOQ requirement
          stock: formData.stock,
          image: formData.image,
          category: formData.category, // category id as string
          sku: formData.sku,
          weight: formData.weight || 0,
          servingSize: formData.servingSize,
          numberOfServings: formData.numberOfServings,
          bagSize: formData.bagSize,
          ingredients: formData.ingredients,
          aminoAcidProfile: formData.aminoAcidProfile,
          nutritionalInfo: formData.nutritionalInfo
        };
        
        console.log('Submitting product data:', newProductData);
        
        const newProduct = await createProduct(newProductData);
        
        toast({
          title: "Success",
          description: `Product "${data.name}" has been created.`,
        });
        
        form.reset();
        onSuccess?.(newProduct);
      }
    } catch (err) {
      console.error('Product form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save product";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Category name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Category already exists',
        variant: 'destructive',
      });
      return;
    }
    try {
      const newCat = await addCategory(newCategoryName);
      setCategories([...categories, newCat]);
      setNewCategoryName('');
      toast({
        title: 'Success',
        description: `Category "${newCategoryName}" added.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  // Handle amino acid profile changes
  const handleAminoAcidChange = (index: number, field: keyof AminoAcid, value: string) => {
    const newAminoAcids = [...aminoAcids];
    newAminoAcids[index] = { ...newAminoAcids[index], [field]: value };
    setAminoAcids(newAminoAcids);
  };

  const handleAddAminoAcid = () => {
    setAminoAcids([...aminoAcids, { name: '', amount: '' }]);
  };

  const handleRemoveAminoAcid = (index: number) => {
    const newAminoAcids = [...aminoAcids];
    newAminoAcids.splice(index, 1);
    setAminoAcids(newAminoAcids);
  };

  // Handle nutritional info changes
  const handleNutritionalValueChange = (index: number, field: keyof NutritionalValue, value: string) => {
    const newNutritionalValues = [...nutritionalValues];
    newNutritionalValues[index] = { ...newNutritionalValues[index], [field]: value };
    setNutritionalValues(newNutritionalValues);
  };

  const handleAddNutritionalValue = () => {
    setNutritionalValues([...nutritionalValues, { name: '', perServing: '', per100g: '' }]);
  };

  const handleRemoveNutritionalValue = (index: number) => {
    const newNutritionalValues = [...nutritionalValues];
    newNutritionalValues.splice(index, 1);
    setNutritionalValues(newNutritionalValues);
  };

  // Handle image upload
  const handleImageUploaded = (url: string) => {
    form.setValue('image', url);
  };

  return (
    <Card className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Details</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Details</TabsTrigger>
              <TabsTrigger value="amino">Amino Acid Profile</TabsTrigger>
              <TabsTrigger value="nutritional">Nutritional Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="PP Protein Vanilla Whey" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
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
                            <div className="flex gap-2">
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                                <DialogTrigger asChild>
                                  <Button type="button" variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Category</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="new-category">Category Name</Label>
                                      <Input
                                        id="new-category"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter category name"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      type="button" 
                                      onClick={handleAddCategory}
                                    >
                                      Add Category
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., PP-VAN-1KG" {...field} />
                            </FormControl>
                            <FormDescription>
                              Unique product code used for accounting and stock control
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Order Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum 12 bags per order
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Stock</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Current inventory quantity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Image</FormLabel>
                          <FormControl>
                            <ImageUploader 
                              currentImageUrl={field.value} 
                              onImageUploaded={handleImageUploaded}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload a product image (max 2MB)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="shipping">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Weight className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Shipping Information</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 1.5" 
                          {...field}
                          // This ensures empty string is converted to undefined instead of 0
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                          // Display empty string instead of 0 when no value
                          value={field.value === undefined || field.value === 0 ? '' : field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        The weight of the product in kilograms (required for shipping calculations)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    Customers who order 12 or more units of protein powder qualify for free shipping.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="nutrition">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="servingSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serving Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 30g" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="numberOfServings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Servings</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bagSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bag Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List product ingredients..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List all ingredients separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="amino">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Amino Acid Profile</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddAminoAcid}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Amino Acid
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 font-medium">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-5">Amount</div>
                    <div className="col-span-2"></div>
                  </div>
                  
                  {aminoAcids.map((aminoAcid, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={aminoAcid.name}
                          onChange={(e) => handleAminoAcidChange(index, 'name', e.target.value)}
                          placeholder="Amino acid name"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={aminoAcid.amount}
                          onChange={(e) => handleAminoAcidChange(index, 'amount', e.target.value)}
                          placeholder="e.g., 1.1g"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveAminoAcid(index)}
                        >
                          <Minus className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {aminoAcids.length === 0 && (
                    <p className="text-gray-500 text-center py-2">No amino acids added</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutritional">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Nutritional Information</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddNutritionalValue}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Nutritional Value
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 font-medium">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-4">Per Serving</div>
                    <div className="col-span-4">Per 100g</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {nutritionalValues.map((nutritionalValue, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                      <div className="col-span-3">
                        <Input
                          value={nutritionalValue.name}
                          onChange={(e) => handleNutritionalValueChange(index, 'name', e.target.value)}
                          placeholder="e.g., Protein"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          value={nutritionalValue.perServing}
                          onChange={(e) => handleNutritionalValueChange(index, 'perServing', e.target.value)}
                          placeholder="e.g., 24.3g"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          value={nutritionalValue.per100g}
                          onChange={(e) => handleNutritionalValueChange(index, 'per100g', e.target.value)}
                          placeholder="e.g., 81g"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveNutritionalValue(index)}
                        >
                          <Minus className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {nutritionalValues.length === 0 && (
                    <p className="text-gray-500 text-center py-2">No nutritional values added</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default ProductForm;
