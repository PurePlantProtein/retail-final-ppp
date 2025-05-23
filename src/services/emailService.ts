
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/product';

export interface EmailResult {
  success: boolean;
  message: string;
}

export type EmailType = 'customer' | 'admin' | 'dispatch' | 'accounts';

export const sendOrderConfirmationEmail = async (
  order: Order, 
  recipientEmail: string,
  emailType: EmailType = 'customer' 
): Promise<EmailResult> => {
  try {
    console.log(`Sending ${emailType} email to: ${recipientEmail}, with order:`, order);
    
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderDetails: order,
        emailType,
        recipientEmail
      }
    });
    
    if (error) {
      console.error('Error response from edge function:', error);
      throw error;
    }
    
    console.log(`${emailType} email sent:`, data);
    return { success: true, message: `${emailType} email sent successfully` };
  } catch (error: any) {
    console.error(`Error sending ${emailType} email:`, error);
    return { success: false, message: error.message || `Failed to send ${emailType} email` };
  }
};

export const sendAdminOrderNotification = async (
  order: Order, 
  adminEmail: string
): Promise<EmailResult> => {
  return sendOrderConfirmationEmail(order, adminEmail, 'admin');
};

export const sendDispatchOrderNotification = async (
  order: Order,
  dispatchEmail: string
): Promise<EmailResult> => {
  return sendOrderConfirmationEmail(order, dispatchEmail, 'dispatch');
};

export const sendAccountsOrderNotification = async (
  order: Order,
  accountsEmail: string
): Promise<EmailResult> => {
  return sendOrderConfirmationEmail(order, accountsEmail, 'accounts');
};
