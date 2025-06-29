
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupNotificationRequest {
  type: 'signup' | 'approval';
  userEmail: string;
  userName: string;
  businessName: string;
  businessType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userEmail, userName, businessName, businessType }: SignupNotificationRequest = await req.json();

    if (type === 'signup') {
      // Send notification to sales team about new signup
      const salesEmailResponse = await resend.emails.send({
        from: "PPP Retailers <noreply@ppprotein.com.au>",
        to: ["sales@ppprotein.com.au"],
        subject: "New User Registration - Requires Approval",
        html: `
          <h1>New User Registration</h1>
          <p>A new user has registered and requires approval:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>User Details:</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Business Name:</strong> ${businessName}</p>
            ${businessType ? `<p><strong>Business Type:</strong> ${businessType}</p>` : ''}
          </div>
          
          <p>Please log into the admin panel to review and approve this user's account.</p>
          
          <p>Best regards,<br>PPP Retailers System</p>
        `,
      });

      console.log("Sales notification email sent:", salesEmailResponse);
    } else if (type === 'approval') {
      // Send approval notification to the user
      const userEmailResponse = await resend.emails.send({
        from: "PPP Retailers <sales@ppprotein.com.au>",
        to: [userEmail],
        subject: "Account Approved - Welcome to PPP Retailers!",
        html: `
          <h1>Welcome to PPP Retailers!</h1>
          <p>Great news! Your account has been approved and you now have access to our wholesale platform.</p>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
              <li>Browse our complete product catalog</li>
              <li>Access exclusive wholesale pricing</li>
              <li>Place orders with your preferred payment terms</li>
              <li>Track your orders and deliveries</li>
            </ul>
          </div>
          
          <p>You can now log in to your account and start placing orders.</p>
          
          <p>If you have any questions, please don't hesitate to contact us at sales@ppprotein.com.au</p>
          
          <p>Welcome aboard!<br>The PPP Retailers Team</p>
        `,
      });

      console.log("User approval email sent:", userEmailResponse);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-notification function:", error);
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
