
import { supabase } from "@/integrations/supabase/client";

// This function is for creating the admin account
export const createAdminAccount = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'myles@sparkflare.com.au',
      password: 'PPPWholesale123!@',
      options: {
        data: {
          business_name: 'Sparkflare Admin'
        }
      }
    });

    if (error) {
      console.error("Error creating admin account:", error.message);
      return { success: false, error };
    }

    console.log("Admin account created:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in createAdminAccount:", error);
    return { success: false, error };
  }
};
