
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CredentialsEmailRequest {
  email: string;
  tempPassword: string;
  businessName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tempPassword, businessName }: CredentialsEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PPP Retailers <noreply@ppprotein.com.au>",
      to: [email],
      subject: "Your PPP Retailers Account - Login Credentials",
      html: `
        <h1>Welcome to PPP Retailers!</h1>
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

    console.log("Credentials email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-credentials function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
