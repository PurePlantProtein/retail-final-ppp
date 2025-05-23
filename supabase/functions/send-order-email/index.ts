
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
    let subject = "";
    let htmlContent = "";

    // Format order items for email
    const itemsHtml = orderDetails.items.map((item: any) => {
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.product.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.product.price).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    // Get shipping address HTML if it exists
    const shippingAddressHtml = orderDetails.shippingAddress ? `
      <div style="margin-top: 20px; margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.name}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.street}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}</p>
        <p style="margin-bottom: 5px;">${orderDetails.shippingAddress.country}</p>
        <p style="margin-bottom: 0;">Phone: ${orderDetails.shippingAddress.phone}</p>
      </div>
    ` : '';

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
    
    // Create standardized HTML email template
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #25a18e; padding: 20px; text-align: center;">
          <img src="https://ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" alt="PP Protein" style="height: 40px;">
        </div>
        
        <div style="padding: 30px 20px;">
          <h1 style="margin-top: 0; color: #25a18e;">${subject}</h1>
          
          <p>Order ID: <strong>${orderDetails.id}</strong></p>
          <p>Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
          <p>Customer: ${orderDetails.userName} (${orderDetails.email})</p>
          <p>Payment Method: ${orderDetails.paymentMethod.replace('-', ' ')}</p>
          
          ${shippingAddressHtml}
          
          <h3 style="margin-top: 30px; color: #333;">Order Summary</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">$${orderDetails.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${orderDetails.notes ? `<p style="margin-top: 20px;"><strong>Notes:</strong> ${orderDetails.notes}</p>` : ''}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Thank you for your order!</p>
            <p>If you have any questions, please contact us at <a href="mailto:info@ppprotein.com.au" style="color: #25a18e;">info@ppprotein.com.au</a></p>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777;">
          <p>&copy; ${new Date().getFullYear()} PP Protein. All rights reserved.</p>
        </div>
      </div>
    `;

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
