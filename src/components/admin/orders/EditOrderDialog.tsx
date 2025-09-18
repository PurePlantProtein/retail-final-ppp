
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Make changes to the order details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="userName" className="text-right">
                Customer
              </label>
              <Input
                id="userName"
                className="col-span-3"
                {...register("userName", { required: "Customer name is required" })}
              />
              {errors.userName && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.userName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select
                onValueChange={(value) => setValue("status", value as OrderStatus)}
                defaultValue={order?.status}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="paymentMethod" className="text-right">
                Payment
              </label>
              <Input
                id="paymentMethod"
                className="col-span-3"
                {...register("paymentMethod")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="invoiceUrl" className="text-right">
                Invoice URL
              </label>
              <Input
                id="invoiceUrl"
                className="col-span-3"
                {...register("invoiceUrl")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right">
                Notes
              </label>
              <Textarea
                id="notes"
                className="col-span-3"
                {...register("notes")}
              />
            </div>

            {/* Items editor */}
            <div className="col-span-4">
              <label className="block text-sm font-medium mb-1">Items</label>
              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const productId = watch(`items.${idx}.product_id` as const);
                  const product = productOptions.find(p => p.id === productId);
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select className="w-full border rounded px-2 py-2" {...register(`items.${idx}.product_id` as const)}>
                          <option value="">Select product</option>
                          {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={1} {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-3">
                        <Input type="number" step="0.01" placeholder={product ? String(product.price) : 'Override'} {...register(`items.${idx}.unit_price` as const, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-1 text-right">
                        <GhostButton type="button" variant="ghost" onClick={()=>remove(idx)}>✕</GhostButton>
                      </div>
                    </div>
                  );
                })}
                <GhostButton type="button" variant="outline" onClick={()=>append({ product_id: '', quantity: 1 })}>Add Item</GhostButton>
              </div>
            </div>
          </div>
          <DialogFooter>
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
