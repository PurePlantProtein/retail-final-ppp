
import React from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, OrderStatus } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { Button as GhostButton } from '@/components/ui/button';

type FormValues = {
  userName: string;
  email: string;
  status: OrderStatus;
  paymentMethod: string;
  invoiceUrl: string;
  notes: string;
  items: Array<{ product_id: string; quantity: number; unit_price?: number }>;
};

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (order: Order) => Promise<boolean>;
  isSubmitting: boolean;
}

export const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  order,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  const { register, handleSubmit, control, setValue, formState: { errors }, watch } = useForm<FormValues>({ defaultValues: { items: [] } });
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' });
  const [productOptions, setProductOptions] = React.useState<Array<{ id: string; name: string; price: number }>>([]);

  React.useEffect(() => {
    if (order) {
      setValue("userName", order.userName);
      setValue("email", order.email || "");
      setValue("status", order.status);
      setValue("paymentMethod", order.paymentMethod);
      setValue("invoiceUrl", order.invoiceUrl || "");
      setValue("notes", order.notes || "");
      const mapped = order.items.map(it => ({
        product_id: (it as any).product_id || it.product.id,
        quantity: Number(it.quantity) || 1,
        unit_price: (it as any).unit_price != null ? Number((it as any).unit_price) : undefined,
      }));
      replace(mapped);
    }
  }, [order, setValue]);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('id,name,price').order('name');
      setProductOptions((data as any[]) || []);
    })();
  }, []);

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      userName: data.userName,
      email: data.email,
      status: data.status,
      paymentMethod: data.paymentMethod,
      invoiceUrl: data.invoiceUrl,
      notes: data.notes,
      items: data.items.map((l) => ({
        product: { ...(order?.items.find(i => (i as any).product_id === l.product_id || i.product.id === l.product_id)?.product || {}), id: l.product_id } as any,
        quantity: Number(l.quantity) || 1,
        unit_price: l.unit_price != null ? Number(l.unit_price) : undefined,
      })) as any,
    };
    
    const success = await onSubmit(updatedOrder);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Order</DialogTitle>
          <DialogDescription>Update order details, items, and notes. Emails are sent to team and customer after saving.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-8 py-2">
            {/* Customer section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label htmlFor="userName" className="text-sm font-medium">Name</label>
                  <Input id="userName" placeholder="Customer name" {...register("userName", { required: "Customer name is required" })} />
                  {errors.userName && (<p className="text-xs text-red-500">{errors.userName.message}</p>)}
                </div>
                <div className="grid gap-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="customer@example.com" {...register("email")} />
                </div>
              </div>
            </section>

            {/* Order meta section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select onValueChange={(value) => setValue("status", value as OrderStatus)} defaultValue={order?.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</label>
                  <Input id="paymentMethod" placeholder="e.g. bank_transfer, card" {...register("paymentMethod")} />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="invoiceUrl" className="text-sm font-medium">Invoice URL</label>
                  <Input id="invoiceUrl" placeholder="https://..." {...register("invoiceUrl")} />
                </div>
              </div>
            </section>

            {/* Items editor with headers */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Items</h3>
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-2 bg-gray-50 p-2 text-xs font-medium text-gray-600">
                  <div className="col-span-7">Product</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price (override)</div>
                  <div className="col-span-1 text-right">Remove</div>
                </div>
                <div className="p-2 space-y-2">
                  {fields.length === 0 && (
                    <p className="text-sm text-gray-500 px-1 py-4">No items. Use "Add Item" to include products in this order.</p>
                  )}
                  {fields.map((field, idx) => {
                    const productId = watch(`items.${idx}.product_id` as const);
                    const product = productOptions.find(p => p.id === productId);
                    return (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-7">
                          <select className="w-full border rounded px-2 py-2 bg-white" {...register(`items.${idx}.product_id` as const)}>
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
                        <div className="col-span-1 text-right">
                          <GhostButton type="button" variant="ghost" onClick={()=>remove(idx)} aria-label="Remove item">✕</GhostButton>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <GhostButton type="button" variant="outline" onClick={()=>append({ product_id: '', quantity: 1 })}>Add Item</GhostButton>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
              <Textarea id="notes" placeholder="Internal notes about this order" {...register("notes")} />
            </section>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
