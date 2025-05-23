
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderDetails: any;
  emailType: 'customer' | 'admin' | 'dispatch' | 'accounts';
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails, emailType, recipientEmail }: OrderEmailRequest = await req.json();

    const fromEmail = "orders@retail.ppprotein.com.au";
    let subject = "Order Notification";
    let htmlContent = "";

    // Set email subject based on type
    switch (emailType) {
      case 'customer':
        subject = `Order Confirmation #${orderDetails.id}`;
        break;
      case 'admin':
        subject = `New Order #${orderDetails.id}`;
        break;
      case 'dispatch':
        subject = `New Order for Dispatch #${orderDetails.id}`;
        break;
      case 'accounts':
        subject = `New Order for Billing #${orderDetails.id}`;
        break;
    }
    
    // Simple HTML content for all email types
    htmlContent = `<h1>${subject}</h1><p>Order details: ${JSON.stringify(orderDetails)}</p>`;

    const emailResponse = await resend.emails.send({
      from: `PP Protein <${fromEmail}>`,
      to: [recipientEmail],
      subject,
      html: htmlContent
    });

    console.log(`${emailType} email sent successfully to ${recipientEmail}:`, emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
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
