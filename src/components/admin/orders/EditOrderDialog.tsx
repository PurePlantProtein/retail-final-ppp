
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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

type FormValues = {
  userName: string;
  status: OrderStatus;
  paymentMethod: string;
  invoiceUrl: string;
  notes: string;
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
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();

  React.useEffect(() => {
    if (order) {
      setValue("userName", order.userName);
      setValue("status", order.status);
      setValue("paymentMethod", order.paymentMethod);
      setValue("invoiceUrl", order.invoiceUrl || "");
      setValue("notes", order.notes || "");
    }
  }, [order, setValue]);

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      userName: data.userName,
      status: data.status,
      paymentMethod: data.paymentMethod,
      invoiceUrl: data.invoiceUrl,
      notes: data.notes,
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
