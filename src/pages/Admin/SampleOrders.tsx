import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const SampleOrders: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostal] = useState('');
  const [country, setCountry] = useState('AU');

  // user search
  const [userQuery, setUserQuery] = useState('');
  const [userOptions, setUserOptions] = useState<Array<{ id: string; label: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [products, setProducts] = useState<Array<{ product_id: string; quantity: number }>>([]);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      setLoadingProducts(true);
      const { data } = await supabase.from('products').select('id,name').order('name');
      setAllProducts((data as any[]) || []);
      setLoadingProducts(false);
    })();
  }, [user, isAdmin]);

  // Search users by business name or email
  React.useEffect(() => {
    if (!userQuery || !isAdmin) { setUserOptions([]); return; }
    let cancelled = false;
    (async () => {
      try {
        setSearchingUsers(true);
        // search by email or business_name using ilike; limit 10
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('id, email, business_name, phone')
          .ilike('email', `%${userQuery}%`)
          .order('id');
        const { data: byName } = await supabase
          .from('profiles')
          .select('id, email, business_name, phone')
          .ilike('business_name', `%${userQuery}%`)
          .order('id');
        const merged = [...(byEmail || []), ...(byName || [])];
        const seen = new Set();
        const options = merged.filter(r => {
          if (seen.has(r.id)) return false; seen.add(r.id); return true;
        }).slice(0, 10).map((r: any) => ({ id: String(r.id), label: `${r.business_name || r.email} (${r.email})`, email: r.email }));
        if (!cancelled) setUserOptions(options);
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userQuery, isAdmin]);

  // When selecting an existing user, auto-fill from profile and last shipping address
  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (profile) {
        setEmail(profile.email || '');
        setName(profile.business_name || '');
        setPhone(profile.phone || '');
      }
      const { data: addr } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', id)
        .order('updated_at', { ascending: false })
        .maybeSingle();
      if (addr) {
        setStreet(addr.street || '');
        setCity(addr.city || '');
        setStateVal(addr.state || '');
        setPostal(addr.postal_code || '');
        setCountry(addr.country || 'AU');
      }
    } catch {}
  };

  const addLine = () => setProducts(prev => [...prev, { product_id: '', quantity: 1 }]);
  const updateLine = (idx: number, patch: Partial<{ product_id: string; quantity: number }>) => {
    setProducts(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l));
  };
  const removeLine = (idx: number) => setProducts(prev => prev.filter((_, i) => i !== idx));

  const shippingAddress = useMemo(() => ({ name, street, city, state: stateVal, postalCode, country, phone }), [name, street, city, stateVal, postalCode, phone, country]);

  const handleCreate = async () => {
    if (!email) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    if (products.length === 0 || products.some(p => !p.product_id || !p.quantity)) {
      toast({ title: 'Add at least one product and quantity', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // build items array compatible with our order row shape { product, quantity }
      const items: any[] = [];
      for (const line of products) {
        const { data: prod } = await supabase.from('products').select('*').eq('id', line.product_id).single();
        if (prod) items.push({ product: prod, quantity: Number(line.quantity) || 1 });
      }

      const payload = {
        user: { email, name, phone, street, city, state: stateVal, postalCode },
        items,
        shipping_address: shippingAddress,
        shipping_option: { id: 'sample', name: 'Sample Delivery', price: 0, description: 'No charge', estimatedDeliveryDays: 0, carrier: 'N/A' },
        notes: 'Sample order created by admin'
      };

      const res = await fetch('/api/admin/sample-order', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) }, body: JSON.stringify(payload) });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || 'Failed');
      toast({ title: 'Sample order created' });
      navigate(`/admin/orders/${body.data.id}`);
    } catch (e: any) {
      toast({ title: 'Failed to create sample order', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create Sample Order</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sample Order</CardTitle>
            <CardDescription>Create a zero-dollar sample order for an existing or new user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing user search */}
            <div className="grid grid-cols-1 gap-2">
              <Label>Find Existing User</Label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by business name or email"
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
              />
              {userQuery && userOptions.length > 0 && (
                <div className="border rounded max-h-56 overflow-auto bg-white">
                  {userOptions.map(opt => (
                    <div key={opt.id} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedUserId===opt.id?'bg-gray-50':''}`}
                      onClick={() => handleSelectUser(opt.id)}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
              {userQuery && !searchingUsers && userOptions.length === 0 && (
                <div className="text-sm text-gray-500">No users found.</div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@example.com" />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label>Street</Label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="Street" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="State" />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input value={postalCode} onChange={e => setPostal(e.target.value)} placeholder="Postal Code" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Products</h3>
                <Button variant="outline" onClick={addLine}>Add Product</Button>
              </div>
              <div className="space-y-2">
                {products.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8">
                      <select className="w-full border rounded px-2 py-2" value={line.product_id} onChange={(e) => updateLine(idx, { product_id: e.target.value })}>
                        <option value="">Select a product</option>
                        {allProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) || 1 })} />
                    </div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" onClick={() => removeLine(idx)}>Remove</Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-gray-500">No products added yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={saving || loadingProducts}>
                {saving ? 'Creating...' : 'Create Sample Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SampleOrders;
