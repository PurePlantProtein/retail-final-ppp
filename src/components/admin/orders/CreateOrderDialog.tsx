import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: any) => Promise<any>;
  isSubmitting: boolean;
}

type LineInput = { product_id: string; quantity: number; unit_price?: number };
interface FormValues {
  userEmail: string;
  userId: string;
  shippingPrice: number;
  notes: string;
  paymentMethod: string;
  status: string;
  street: string; city: string; state: string; postalCode: string; country: string; name: string; phone: string;
  items: LineInput[];
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ open, onOpenChange, onCreate, isSubmitting }) => {
  const { isAdmin } = useAuth();
  const { register, handleSubmit, control, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      userEmail: '', userId: '', shippingPrice: 0, notes: '', paymentMethod: 'manual', status: 'pending', country: 'AU', items: []
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [productOptions, setProductOptions] = React.useState<Array<{ id: string; name: string; price: number }>>([]);
  const [userQuery, setUserQuery] = React.useState('');
  const [userOptions, setUserOptions] = React.useState<Array<{ id: string; label: string; email: string }>>([]);

  React.useEffect(() => {
    if (!open) return; (async () => {
      const { data } = await supabase.from('products').select('id,name,price').order('name');
      setProductOptions((data as any[]) || []);
    })();
  }, [open]);

  // user search
  React.useEffect(() => {
    if (!userQuery) { setUserOptions([]); return; }
    let cancelled = false; (async () => {
      const { data: byEmail } = await supabase.from('profiles').select('id,email,business_name,phone').ilike('email', `%${userQuery}%`);
      const { data: byName } = await supabase.from('profiles').select('id,email,business_name,phone').ilike('business_name', `%${userQuery}%`);
      const merged = [...(byEmail||[]), ...(byName||[])];
      const seen = new Set();
      const opts = merged.filter(r=>{ if(seen.has(r.id)) return false; seen.add(r.id); return true; }).slice(0,10).map((r:any)=>({ id:String(r.id), label:`${r.business_name || r.email} (${r.email})`, email:r.email }));
      if(!cancelled) setUserOptions(opts);
    })(); return () => { cancelled = true; };
  }, [userQuery]);

  const selectExistingUser = async (id: string) => {
    setValue('userId', id);
    setUserQuery('');

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    console.debug('[CreateOrderDialog] profile fetched', profile);
    if (profile) {
      setValue('userEmail', profile.email || '');
      setValue('name', profile.business_name || '');
      setValue('phone', profile.phone || '');
    }

    // Helper: parse business_address fallback (very simple heuristic: parts split by comma)
    const parseBusinessAddress = (raw?: string) => {
      if (!raw) return null;
      const parts = raw.split(/,\s*/).map(p => p.trim()).filter(Boolean);
      // Expect at least 3 parts: street, city, state+postcode (AU) or state, postcode separately
      let street = '', city = '', state = '', postalCode = '';
      if (parts.length >= 3) {
        street = parts[0];
        city = parts[1];
        const tail = parts.slice(2).join(' ');
        const m = tail.match(/([A-Z]{2,3})\s*(\d{3,4})?/i);
        if (m) {
          state = m[1].toUpperCase();
          if (m[2]) postalCode = m[2];
        }
        if (!postalCode) {
          const pc = tail.match(/\b\d{4}\b/);
            if (pc) postalCode = pc[0];
        }
      }
      return { street, city, state, postalCode };
    };

    // Fetch most recent shipping address
    try {
      const { data: addr } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', Number(id))
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      console.debug('[CreateOrderDialog] shipping address fetched', addr);
      if (addr) {
        setValue('street', addr.street || '');
        setValue('city', addr.city || '');
        setValue('state', addr.state || '');
        setValue('postalCode', addr.postal_code || '');
        setValue('country', addr.country || 'AU');
        if (!watch('name') && addr.name) setValue('name', addr.name);
        if (!watch('phone') && addr.phone) setValue('phone', addr.phone);
        return; // done
      }
    } catch (e) {
      console.warn('[CreateOrderDialog] shipping address fetch error', e);
    }

    // Fallback to business_address if no shipping address found
    if (profile?.business_address) {
      const parsed = parseBusinessAddress(profile.business_address);
      if (parsed) {
        if (parsed.street) setValue('street', parsed.street);
        if (parsed.city) setValue('city', parsed.city);
        if (parsed.state) setValue('state', parsed.state);
        if (parsed.postalCode) setValue('postalCode', parsed.postalCode);
        if (!watch('country')) setValue('country', 'AU');
        console.debug('[CreateOrderDialog] populated from business_address fallback', parsed);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.userEmail && !data.userId) return; if (!data.items.length) return;
    const payload = {
      user: { id: data.userId || undefined, email: data.userEmail || undefined },
      items: data.items.map(l => ({ product_id: l.product_id, quantity: Number(l.quantity)||1, unit_price: l.unit_price != null ? Number(l.unit_price) : undefined })),
      shipping_price: Number(data.shippingPrice) || 0,
      shipping_address: { name: data.name, street: data.street, city: data.city, state: data.state, postalCode: data.postalCode, country: data.country, phone: data.phone },
      notes: data.notes,
      payment_method: data.paymentMethod,
      status: data.status
    };
    const created = await onCreate(payload);
    if (created) { reset(); onOpenChange(false); }
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>Manually create an order with custom prices.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium">Find User</label>
              <input className="w-full border rounded px-2 py-2" placeholder="Search by email or business name" value={userQuery} onChange={e=>setUserQuery(e.target.value)} />
              {userQuery && userOptions.length>0 && (
                <div className="border rounded mt-1 max-h-40 overflow-auto bg-white text-sm">
                  {userOptions.map(opt => <div key={opt.id} className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={()=>selectExistingUser(opt.id)}>{opt.label}</div>)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">User Email</label>
                <Input {...register('userEmail')} placeholder="customer@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium">Customer Name</label>
                <Input {...register('name')} />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <Input {...register('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select className="w-full border rounded px-2 py-2" {...register('status')}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Payment Method</label>
                <Input {...register('paymentMethod')} />
              </div>
              <div>
                <label className="block text-sm font-medium">Shipping Price</label>
                <Input type="number" step="0.01" {...register('shippingPrice', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2"><label className="block text-sm font-medium">Street</label><Input {...register('street')} /></div>
              <div><label className="block text-sm font-medium">City</label><Input {...register('city')} /></div>
              <div><label className="block text-sm font-medium">State</label><Input {...register('state')} /></div>
              <div><label className="block text-sm font-medium">Postal Code</label><Input {...register('postalCode')} /></div>
              <div><label className="block text-sm font-medium">Country</label><Input {...register('country')} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Items</label>
              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const productId = watch(`items.${idx}.product_id` as const);
                  const product = productOptions.find(p => p.id === productId);
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select className="w-full border rounded px-2 py-2" {...register(`items.${idx}.product_id` as const)}>
                          <option value="">Select product</option>
                          {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={1} {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" step="0.01" placeholder={product ? String(product.price) : 'Override'} {...register(`items.${idx}.unit_price` as const, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-2 text-sm">
                        {product && (
                          <span className="text-gray-500">{formatCurrency((watch(`items.${idx}.unit_price` as const) || product.price || 0) * (watch(`items.${idx}.quantity` as const) || 1))}</span>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button type="button" variant="ghost" onClick={()=>remove(idx)}>✕</Button>
                      </div>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={()=>append({ product_id: '', quantity: 1 })}>Add Item</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <Textarea {...register('notes')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Order'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;