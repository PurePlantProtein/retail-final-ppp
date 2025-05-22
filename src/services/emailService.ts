
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/product';

export interface EmailResult {
  success: boolean;
  message: string;
}

export const sendOrderConfirmationEmail = async (
  order: Order, 
  customerEmail: string
): Promise<EmailResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderDetails: order,
        emailType: 'customer',
        recipientEmail: customerEmail
      }
    });
    
    if (error) throw error;
    
    console.log('Customer order confirmation email sent:', data);
    return { success: true, message: 'Order confirmation email sent' };
  } catch (error: any) {
    console.error('Error sending customer order email:', error);
    return { success: false, message: error.message || 'Failed to send order confirmation email' };
  }
};

export const sendAdminOrderNotification = async (
  order: Order, 
  adminEmail: string
): Promise<EmailResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderDetails: order,
        emailType: 'admin',
        recipientEmail: adminEmail
      }
    });
    
    if (error) throw error;
    
    console.log('Admin order notification email sent:', data);
    return { success: true, message: 'Admin notification email sent' };
  } catch (error: any) {
    console.error('Error sending admin order email:', error);
    return { success: false, message: error.message || 'Failed to send order notification email' };
  }
};
