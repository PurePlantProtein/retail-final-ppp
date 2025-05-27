
import { supabase } from '@/integrations/supabase/client';

// Generate a random temporary password
export const generateTempPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const sendCredentialsEmail = async (email: string, tempPassword: string, businessName: string) => {
  try {
    const { error } = await supabase.functions.invoke('send-user-credentials', {
      body: {
        email,
        tempPassword,
        businessName,
      }
    });
    
    if (error) {
      console.error('Error sending credentials email:', error);
      throw error;
    }
    
    console.log('Credentials email sent successfully');
  } catch (error) {
    console.error('Failed to send credentials email:', error);
    throw error;
  }
};
