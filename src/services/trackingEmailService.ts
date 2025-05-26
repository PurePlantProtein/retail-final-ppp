
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/product';

export interface TrackingEmailResult {
  success: boolean;
  message: string;
}

export const sendTrackingEmail = async (
  order: Order
): Promise<TrackingEmailResult> => {
  try {
    console.log('Sending tracking email for order:', order.id);
    
    const { data, error } = await supabase.functions.invoke('send-tracking-email', {
      body: {
        orderDetails: order
      }
    });
    
    if (error) {
      console.error('Error response from tracking email function:', error);
      throw error;
    }
    
    console.log('Tracking email sent:', data);
    return { success: true, message: 'Tracking email sent successfully' };
  } catch (error: any) {
    console.error('Error sending tracking email:', error);
    return { success: false, message: error.message || 'Failed to send tracking email' };
  }
};
