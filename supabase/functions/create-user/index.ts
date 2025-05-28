
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.7';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface CreateUserRequest {
  email: string;
  businessName: string;
  businessType: string;
  role: "admin" | "retailer" | "distributor";
  contactName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  emailCredentials: boolean;
  currentUserId: string;
}

// Generate a random temporary password
const generateTempPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const sendCredentialsEmail = async (email: string, tempPassword: string, businessName: string) => {
  try {
    const { error } = await resend.emails.send({
      from: "PP Protein Wholesale <noreply@ppprotein.com.au>",
      to: [email],
      subject: "Your PP Protein Wholesale Account - Login Credentials",
      html: `
        <h1>Welcome to PP Protein Wholesale!</h1>
        <p>Your wholesale account has been created for <strong>${businessName}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Important Security Notice:</h3>
          <p>For your security, please reset your password immediately after your first login:</p>
          <ol>
            <li>Visit the login page and sign in with the credentials above</li>
            <li>Go to your profile settings</li>
            <li>Click "Reset Password" to create a secure password of your choice</li>
          </ol>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>Browse our complete product catalog</li>
            <li>Access exclusive wholesale pricing</li>
            <li>Place orders with your preferred payment terms</li>
            <li>Track your orders and deliveries</li>
          </ul>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact us at sales@ppprotein.com.au</p>
        
        <p>Welcome aboard!<br>The PP Protein Team</p>
      `,
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

// Clean up orphaned profiles (profiles without corresponding auth users)
const cleanupOrphanedProfiles = async (email: string) => {
  try {
    console.log('Checking for orphaned profiles for email:', email);
    
    // Get profiles for this email
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email);
    
    if (profilesError) {
      console.error('Error checking profiles:', profilesError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found for email:', email);
      return;
    }
    
    // Check which profiles have corresponding auth users
    for (const profile of profiles) {
      console.log('Checking profile:', profile.id);
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      
      if (authError || !authUser.user) {
        console.log('Found orphaned profile, deleting:', profile.id);
        
        // Delete orphaned profile and its roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', profile.id);
        await supabaseAdmin.from('profiles').delete().eq('id', profile.id);
        
        console.log('Cleaned up orphaned profile:', profile.id);
      } else {
        console.log('Profile has corresponding auth user:', profile.id);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Don't throw - cleanup failure shouldn't block user creation
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CreateUserRequest = await req.json();
    const {
      email,
      businessName,
      businessType,
      role,
      contactName,
      phone,
      street,
      city,
      state,
      postalCode,
      emailCredentials,
      currentUserId
    } = requestData;

    console.log('Starting user creation process for:', email);

    // Clean up any orphaned profiles first
    await cleanupOrphanedProfiles(email);

    // Check if auth user already exists
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUser.users.some(user => user.email === email);
    
    if (userExists) {
      console.log('Auth user already exists for email:', email);
      return new Response(
        JSON.stringify({ 
          error: `A user with the email ${email} already exists.` 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if profile already exists (additional safety check)
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      throw new Error(`Failed to check existing user: ${checkError.message}`);
    }
    
    if (existingProfile) {
      console.log('Profile already exists for email:', email);
      return new Response(
        JSON.stringify({ 
          error: `A profile with the email ${email} already exists.` 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Generate temporary password
    const tempPassword = emailCredentials ? generateTempPassword() : 'TempPass123!';
    
    // Step 1: Create auth user using admin API
    console.log('Creating auth user...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email for admin-created users
    });

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError);
      throw new Error(`Failed to create auth user: ${authError?.message || 'No user returned'}`);
    }

    console.log('Auth user created successfully:', authUser.user.id);
    let createdUserId = authUser.user.id;

    try {
      // Step 2: Create profile using the auth user's ID
      console.log('Creating profile for user:', createdUserId);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: email,
          business_name: businessName,
          business_type: businessType,
          phone: phone,
          business_address: `${street}, ${city}, ${state} ${postalCode}`,
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentUserId,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('Profile created successfully for user:', authUser.user.id);

      // Step 3: Assign user role with proper type casting
      console.log('Assigning role:', role);
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: role as "admin" | "retailer" | "distributor"
        });

      if (roleError) {
        console.error('Error adding role:', roleError);
        // Don't throw here - role assignment failure shouldn't break the whole process
        console.warn('User created but role assignment failed:', roleError.message);
      } else {
        console.log('Role assigned successfully:', role);
      }

      // Step 4: Send credentials email if requested
      let emailSent = false;
      if (emailCredentials) {
        try {
          await sendCredentialsEmail(email, tempPassword, businessName);
          emailSent = true;
        } catch (emailError) {
          console.error('Failed to send credentials email:', emailError);
          // Don't fail the whole process if email fails
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: emailCredentials && emailSent 
            ? `${businessName} has been added and login credentials have been emailed to ${email}.`
            : emailCredentials && !emailSent
            ? `${businessName} has been added but failed to send credentials email. Please provide login details manually.`
            : `${businessName} (${email}) has been added and approved.`,
          emailSent: emailCredentials ? emailSent : null
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (error: any) {
      console.error('Error in user creation process:', error);
      
      // Comprehensive cleanup: Delete the auth user and any created records
      try {
        console.log('Starting cleanup for user:', createdUserId);
        
        // Delete in reverse order: roles, profile, then auth user
        const { error: roleCleanupError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', createdUserId);
        
        if (roleCleanupError) {
          console.error('Error cleaning up roles:', roleCleanupError);
        } else {
          console.log('Roles cleaned up successfully');
        }
        
        const { error: profileCleanupError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', createdUserId);
        
        if (profileCleanupError) {
          console.error('Error cleaning up profile:', profileCleanupError);
        } else {
          console.log('Profile cleaned up successfully');
        }
        
        const { error: authCleanupError } = await supabaseAdmin.auth.admin.deleteUser(createdUserId);
        
        if (authCleanupError) {
          console.error('Error cleaning up auth user:', authCleanupError);
        } else {
          console.log('Auth user cleaned up successfully');
        }
        
        console.log('Cleanup completed for user:', createdUserId);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      
      throw error;
    }

  } catch (error: any) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
