
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrackingEmailRequest {
  orderDetails: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails }: TrackingEmailRequest = await req.json();

    if (!orderDetails.trackingInfo) {
      throw new Error("No tracking information found in order");
    }

    const fromEmail = "orders@retail.ppprotein.com.au";
    const subject = `Your order #${orderDetails.id} has shipped!`;
    
    // Create tracking button/link
    const trackingButton = orderDetails.trackingInfo.trackingUrl 
      ? `<a href="${orderDetails.trackingInfo.trackingUrl}" target="_blank" style="background-color: #25a18e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold;">Track Your Package</a>`
      : '';

    // Create shipping details
    const shippingDetails = `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Shipping Details</h3>
        <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${orderDetails.trackingInfo.trackingNumber}</p>
        <p style="margin: 5px 0;"><strong>Carrier:</strong> ${orderDetails.trackingInfo.carrier}</p>
        ${orderDetails.trackingInfo.shippedDate ? `<p style="margin: 5px 0;"><strong>Shipped Date:</strong> ${new Date(orderDetails.trackingInfo.shippedDate).toLocaleDateString()}</p>` : ''}
        ${orderDetails.trackingInfo.estimatedDeliveryDate ? `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${new Date(orderDetails.trackingInfo.estimatedDeliveryDate).toLocaleDateString()}</p>` : ''}
      </div>
    `;

    // Get shipping address HTML if it exists
    const shippingAddressHtml = orderDetails.shippingAddress ? `
      <div style="margin-top: 20px; margin-bottom: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #333;">Delivery Address</h3>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.name}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.street}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.country}</p>
      </div>
    ` : '';
    
    // Create standardized HTML email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #25a18e; padding: 20px; text-align: center;">
          <img src="https://ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" alt="PP Protein" style="height: 40px;">
        </div>
        
        <div style="padding: 30px 20px;">
          <h1 style="margin-top: 0; color: #25a18e;">🚚 Your Order is On The Way!</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">Great news! Your order <strong>#${orderDetails.id}</strong> has been shipped and is on its way to you.</p>
          
          ${shippingDetails}
          
          <div style="text-align: center; margin: 30px 0;">
            ${trackingButton}
          </div>
          
          ${shippingAddressHtml}
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff8dc; border-radius: 5px; border-left: 4px solid #ffd700;">
            <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> Keep your tracking number handy for easy package monitoring. You can also bookmark the tracking link for quick access.</p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>If you have any questions about your shipment, please don't hesitate to contact us at <a href="mailto:info@ppprotein.com.au" style="color: #25a18e;">info@ppprotein.com.au</a></p>
            <p>Thank you for choosing PP Protein!</p>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777;">
          <p>&copy; ${new Date().getFullYear()} PP Protein. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: `PP Protein <${fromEmail}>`,
      to: [orderDetails.email],
      subject,
      html: htmlContent
    });

    console.log(`Tracking email sent successfully to ${orderDetails.email}:`, emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tracking-email function:", error);
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
