
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, TrackingInfo } from '@/types/product';

type FormValues = {
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  shippedDate: string;
  estimatedDeliveryDate: string;
};

interface TrackingInfoDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (order: Order) => Promise<boolean>;
  isSubmitting: boolean;
}

export const TrackingInfoDialog: React.FC<TrackingInfoDialogProps> = ({
  order,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValues>();

  React.useEffect(() => {
    if (order) {
      setValue("trackingNumber", order.trackingInfo?.trackingNumber || "");
      setValue("carrier", order.trackingInfo?.carrier || "");
      setValue("trackingUrl", order.trackingInfo?.trackingUrl || "");
      setValue("shippedDate", order.trackingInfo?.shippedDate || "");
      setValue("estimatedDeliveryDate", order.trackingInfo?.estimatedDeliveryDate || "");
    }
  }, [order, setValue]);

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!order) return;
    
    const trackingInfo: TrackingInfo = {
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      trackingUrl: data.trackingUrl,
      shippedDate: data.shippedDate,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
    };
    
    const updatedOrder = {
      ...order,
      trackingInfo,
      status: order.status === 'processing' ? 'shipped' as const : order.status,
    };
    
    const success = await onSubmit(updatedOrder);
    if (success) {
      onOpenChange(false);
      reset();
    }
  };

  const carriers = [
    'FedEx',
    'UPS',
    'DHL',
    'USPS',
    'Canada Post',
    'Royal Mail',
    'Australia Post',
    'Other'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Tracking Information</DialogTitle>
          <DialogDescription>
            Add tracking details for order #{order?.id}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="trackingNumber" className="text-right">
                Tracking Number
              </label>
              <Input
                id="trackingNumber"
                className="col-span-3"
                {...register("trackingNumber", { required: "Tracking number is required" })}
              />
              {errors.trackingNumber && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.trackingNumber.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="carrier" className="text-right">
                Carrier
              </label>
              <Select
                onValueChange={(value) => setValue("carrier", value)}
                defaultValue={order?.trackingInfo?.carrier}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="trackingUrl" className="text-right">
                Tracking URL
              </label>
              <Input
                id="trackingUrl"
                className="col-span-3"
                placeholder="https://..."
                {...register("trackingUrl")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="shippedDate" className="text-right">
                Shipped Date
              </label>
              <Input
                id="shippedDate"
                type="date"
                className="col-span-3"
                {...register("shippedDate")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="estimatedDeliveryDate" className="text-right">
                Est. Delivery
              </label>
              <Input
                id="estimatedDeliveryDate"
                type="date"
                className="col-span-3"
                {...register("estimatedDeliveryDate")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Tracking Info"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
