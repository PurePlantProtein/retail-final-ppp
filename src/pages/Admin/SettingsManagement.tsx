
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Truck, Image } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { updateFavicon } from '@/utils/securityUtils';

const SettingsManagement = () => {
  const [siteIcon, setSiteIcon] = useState<string>("");
  const [siteLogo, setSiteLogo] = useState<string>("");
  const { toast } = useToast();

  const handleSiteIconUploaded = (url: string) => {
    setSiteIcon(url);
    // Save to localStorage for persistence
    localStorage.setItem('site_icon', url);
    
    // Update favicon dynamically
    updateFavicon(url);
    
    toast({
      title: "Site Icon Updated",
      description: "The site icon has been updated successfully.",
    });
  };

  const handleSiteLogoUploaded = (url: string) => {
    setSiteLogo(url);
    // Save to localStorage for persistence
    localStorage.setItem('site_logo', url);
    
    toast({
      title: "Site Logo Updated",
      description: "The site logo has been updated successfully and will appear in the navbar and footer.",
    });
  };

  // Load saved values on component mount
  React.useEffect(() => {
    const savedIcon = localStorage.getItem('site_icon');
    const savedLogo = localStorage.getItem('site_logo');
    
    if (savedIcon) {
      setSiteIcon(savedIcon);
    }
    
    if (savedLogo) {
      setSiteLogo(savedLogo);
    }
  }, []);

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-6 settings-container">
          <h1 className="text-2xl font-bold mb-6 text-left">Settings</h1>
          
          <Tabs defaultValue="branding">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="other">Other Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="text-left">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">General Settings</CardTitle>
                    <CardDescription className="text-left">
                      Configure general store settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Configure store name, currency, and other basic settings.</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Manage General Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">Email Settings</CardTitle>
                    <CardDescription className="text-left">
                      Configure email notifications for orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Set up order notification emails for administrators and customers.</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <Link to="/admin/email-settings">
                        <Mail className="mr-2 h-4 w-4" /> Manage Email Settings
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">Payment Settings</CardTitle>
                    <CardDescription className="text-left">
                      Configure payment gateways and options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Set up payment methods and processors for your store.</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Manage Payment Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">Shipping Settings</CardTitle>
                    <CardDescription className="text-left">
                      Configure shipping options and rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Set up shipping zones, methods, and free shipping rules.</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <Link to="/admin/shipping-settings">
                        <Truck className="mr-2 h-4 w-4" /> Manage Shipping Settings
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="branding" className="text-left">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-left">
                    <Image className="mr-2 h-5 w-5" />
                    Site Branding
                  </CardTitle>
                  <CardDescription className="text-left">
                    Customize your site logo and favicon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-left">Site Icon (Favicon)</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-left">
                        Upload a square image (PNG recommended) that will be used as your site's favicon.
                        Recommended size: 32x32 pixels or larger.
                      </p>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <ImageUploader 
                          currentImageUrl={siteIcon}
                          onImageUploaded={handleSiteIconUploaded}
                          className="w-full md:w-1/3"
                        />
                        {siteIcon && (
                          <div className="border rounded-md p-4 flex flex-col items-center">
                            <p className="text-sm font-medium mb-2">Icon Preview</p>
                            <img 
                              src={siteIcon} 
                              alt="Site Icon Preview" 
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-left">Site Logo</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-left">
                        Upload your company logo. This will be displayed in the header, footer, and other places throughout the site.
                        Recommended size: 250x50 pixels (or maintain this aspect ratio).
                      </p>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <ImageUploader 
                          currentImageUrl={siteLogo}
                          onImageUploaded={handleSiteLogoUploaded}
                          className="w-full md:w-1/3"
                        />
                        {siteLogo && (
                          <div className="border rounded-md p-4 flex flex-col items-center">
                            <p className="text-sm font-medium mb-2">Logo Preview</p>
                            <img 
                              src={siteLogo} 
                              alt="Site Logo Preview" 
                              className="h-12 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="other" className="text-left">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">Other Settings</CardTitle>
                    <CardDescription className="text-left">Additional configuration options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>More settings will be added here in future updates.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default SettingsManagement;
