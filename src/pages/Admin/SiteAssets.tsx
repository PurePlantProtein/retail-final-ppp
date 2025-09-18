import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Trash, Clipboard, ClipboardCheck } from 'lucide-react';
import { deleteAsset, getAssetUrl, listAssets, uploadAsset, SiteAsset } from '@/services/assetsService';

const SiteAssets: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState<string>('');

  const refresh = async () => {
    try {
      const data = await listAssets();
      setAssets(data);
    } catch (e: any) {
      toast({ title: 'Failed to load assets', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => { refresh(); }, []);

  const onUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    try {
      setIsUploading(true);
      await uploadAsset(file, key.trim() || undefined);
      setFile(null);
      setKey('');
      await refresh();
      toast({ title: 'Uploaded successfully' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (name: string) => {
    try {
      await deleteAsset(name);
      await refresh();
      toast({ title: 'Deleted' });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const copyUrl = async (name: string) => {
    try {
      const url = getAssetUrl(name);
      await navigator.clipboard.writeText(url);
      setCopied(name);
      setTimeout(() => setCopied(''), 1500);
    } catch {}
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Site Assets</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-gray-600">File</label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-gray-600">Optional key (e.g., login-background)</label>
                  <Input placeholder="login-background" value={key} onChange={(e) => setKey(e.target.value)} />
                </div>
                <div className="md:col-span-1">
                  <Button onClick={onUpload} disabled={isUploading || !file} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tip: Upload with key "login-background" to set the Login page background image.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((a) => (
              <Card key={a.name}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium break-all">{a.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full aspect-video bg-gray-50 border rounded overflow-hidden flex items-center justify-center">
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => copyUrl(a.name)}>
                      {copied === a.name ? <ClipboardCheck className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}Copy URL
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(a.name)}>
                      <Trash className="h-4 w-4 mr-2" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default SiteAssets;
