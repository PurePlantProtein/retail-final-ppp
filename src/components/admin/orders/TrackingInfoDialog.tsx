
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
import { autoDetectCarrier, generateTrackingUrl, getEstimatedDeliveryDate } from '@/utils/trackingUtils';

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
  trackingInfo?: TrackingInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Updated to reflect the actual return shape from handleTrackingSubmit
  onSubmit: (orderId: string, trackingInfo: TrackingInfo) => Promise<{ success: boolean; emailSent: boolean }>;
  isSubmitting: boolean;
}

export const TrackingInfoDialog: React.FC<TrackingInfoDialogProps> = ({
  order,
  trackingInfo,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      sendEmail: true,
      shippedDate: new Date().toISOString().split('T')[0] // Auto-set to today
    }
  });
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const sendEmailValue = watch('sendEmail');
  const trackingNumber = watch('trackingNumber');
  const carrier = watch('carrier');

React.useEffect(() => {
  if (trackingInfo) {
    setValue("trackingNumber", trackingInfo.trackingNumber || "");
    setValue("carrier", trackingInfo.carrier || "");
    setValue("trackingUrl", trackingInfo.trackingUrl || "");
    setValue("shippedDate", trackingInfo.shippedDate || new Date().toISOString().split('T')[0]);
    setValue("estimatedDeliveryDate", trackingInfo.estimatedDeliveryDate || "");
  } else {
    // Defaults
    setValue("trackingNumber", "");
    setValue("carrier", "");
    setValue("trackingUrl", "");
    setValue("shippedDate", new Date().toISOString().split('T')[0]);
    setValue("estimatedDeliveryDate", "");
  }

  setValue("sendEmail", true);
}, [trackingInfo, setValue]);

  // Auto-detect carrier when tracking number changes
  React.useEffect(() => {
    if (trackingNumber && trackingNumber.length > 5) {
      const detectedCarrier = autoDetectCarrier(trackingNumber);
      if (detectedCarrier && detectedCarrier !== carrier) {
        setValue("carrier", detectedCarrier);
        
        // Auto-generate tracking URL
        const trackingUrl = generateTrackingUrl(trackingNumber, detectedCarrier);
        if (trackingUrl) {
          setValue("trackingUrl", trackingUrl);
        }
        
        // Auto-calculate estimated delivery
        const estimatedDelivery = getEstimatedDeliveryDate(detectedCarrier);
        if (estimatedDelivery) {
          setValue("estimatedDeliveryDate", estimatedDelivery);
        }
      }
    }
  }, [trackingNumber, carrier, setValue]);

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!order) return;

    const trackingInfo: TrackingInfo = {
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      trackingUrl: data.trackingUrl,
      shippedDate: data.shippedDate,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
    };

    console.log('Button Clicked - Form Data:', trackingInfo);
    
    const result = await onSubmit(order.id, trackingInfo);
    if (result && result.success) {
      if (data.sendEmail) {
        if (result.emailSent) {
          toast({
            title: 'Tracking Added & Email Sent',
            description: `Tracking information saved and email sent to ${order.email}.`
          });
        } else {
          toast({
            title: 'Tracking Added',
            description: 'Tracking information saved, but email could not be sent.',
            variant: 'destructive'
          });
        }
      } else {
        toast({ title: 'Tracking Added', description: 'Tracking information has been saved successfully.' });
      }
      onOpenChange(false);
      reset();
    }
  };

  const handleQuickFill = () => {
    // Quick fill with common Australian carriers and today's date
    const today = new Date().toISOString().split('T')[0];
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 days from today
    
    setValue("shippedDate", today);
    setValue("estimatedDeliveryDate", estimatedDelivery.toISOString().split('T')[0]);
    setValue("sendEmail", true);
  };

  const carriers = [
    'Australia Post',
    'StarTrack',
    'Toll',
    'TNT',
    'DHL',
    'FedEx',
    'UPS',
    'Aramex',
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
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={handleQuickFill}>
                Quick Fill Dates
              </Button>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="trackingNumber" className="text-right">
                Tracking Number *
              </label>
              <div className="col-span-3">
                <Input
                  id="trackingNumber"
                  placeholder="Enter tracking number (carrier auto-detected)"
                  {...register("trackingNumber", { required: "Tracking number is required" })}
                />
                {errors.trackingNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.trackingNumber.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="carrier" className="text-right">
                Carrier
              </label>
              <Select
                onValueChange={(value) => {
                  setValue("carrier", value);
                  // Auto-generate tracking URL when carrier changes
                  if (trackingNumber) {
                    const trackingUrl = generateTrackingUrl(trackingNumber, value);
                    if (trackingUrl) {
                      setValue("trackingUrl", trackingUrl);
                    }
                  }
                }}
                value={carrier}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select or auto-detected" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrierOption) => (
                    <SelectItem key={carrierOption} value={carrierOption}>
                      {carrierOption}
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
                placeholder="Auto-generated or enter manually"
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
