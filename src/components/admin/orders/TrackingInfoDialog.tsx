
import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Order, TrackingInfo } from '@/types/product';
import { sendTrackingEmail } from '@/services/trackingEmailService';

type FormValues = {
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  shippedDate: string;
  estimatedDeliveryDate: string;
  sendEmail: boolean;
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
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      sendEmail: true // Default to sending email
    }
  });
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const sendEmailValue = watch('sendEmail');

  React.useEffect(() => {
    if (order) {
      setValue("trackingNumber", order.trackingInfo?.trackingNumber || "");
      setValue("carrier", order.trackingInfo?.carrier || "");
      setValue("trackingUrl", order.trackingInfo?.trackingUrl || "");
      setValue("shippedDate", order.trackingInfo?.shippedDate || "");
      setValue("estimatedDeliveryDate", order.trackingInfo?.estimatedDeliveryDate || "");
      setValue("sendEmail", true);
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
    
    // First save the tracking info
    const success = await onSubmit(updatedOrder);
    if (success) {
      // If saving was successful and user wants to send email
      if (data.sendEmail) {
        setIsSendingEmail(true);
        try {
          const emailResult = await sendTrackingEmail(updatedOrder);
          if (emailResult.success) {
            toast({
              title: "Tracking Added & Email Sent",
              description: `Tracking information saved and notification email sent to ${order.email}.`,
            });
          } else {
            toast({
              title: "Tracking Added",
              description: "Tracking information saved, but email could not be sent.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error sending tracking email:', error);
          toast({
            title: "Tracking Added",
            description: "Tracking information saved, but email could not be sent.",
            variant: "destructive",
          });
        } finally {
          setIsSendingEmail(false);
        }
      } else {
        toast({
          title: "Tracking Added",
          description: "Tracking information has been saved successfully.",
        });
      }
      
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">
                Send Email
              </label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={sendEmailValue}
                  onCheckedChange={(checked) => setValue("sendEmail", !!checked)}
                />
                <label htmlFor="sendEmail" className="text-sm">
                  Send tracking notification email to customer
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isSendingEmail}>
              {isSubmitting || isSendingEmail ? "Saving..." : "Save Tracking Info"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
