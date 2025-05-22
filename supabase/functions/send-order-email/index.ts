
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderDetails: {
    id: string;
    userName: string;
    total: number;
    items: Array<{
      product: {
        name: string;
        price: number;
      };
      quantity: number;
    }>;
    shippingAddress: {
      name: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    shippingOption: {
      name: string;
      price: number;
    };
    paymentMethod: string;
  };
  emailType: "customer" | "admin";
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { orderDetails, emailType, recipientEmail }: OrderEmailRequest = await req.json();
    
    let from = "Pure Plant Protein <sales@ppprotein.com.au>";
    let subject = "";
    let html = "";
    
    // Format product items for email
    const itemsList = orderDetails.items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join("");
    
    if (emailType === "customer") {
      subject = `Your PP Protein Order #${orderDetails.id} Confirmation`;
      
      // Create HTML for customer order confirmation email
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #25a18e; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Order Confirmation</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello ${orderDetails.shippingAddress.name},</p>
            
            <p>Thank you for your order with Pure Plant Protein. We've received your order and are processing it now.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Summary</h2>
              <p><strong>Order Number:</strong> #${orderDetails.id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'PayPal'}</p>
            </div>
            
            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Product</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right;">$${(orderDetails.total - orderDetails.shippingOption.price).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Shipping (${orderDetails.shippingOption.name}):</td>
                  <td style="padding: 8px; text-align: right;">$${orderDetails.shippingOption.price.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">$${orderDetails.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Shipping Details</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
              <p style="margin: 0;">${orderDetails.shippingAddress.name}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.street}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.country}</p>
              <p style="margin: 0;">Phone: ${orderDetails.shippingAddress.phone}</p>
            </div>
            
            <p style="margin-top: 30px;">
              If you have any questions about your order, please contact us at <a href="mailto:sales@ppprotein.com.au">sales@ppprotein.com.au</a>.
            </p>
            
            <p>Thank you for choosing Pure Plant Protein.</p>
            
            <p>Best regards,<br/>The Pure Plant Protein Team</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>&copy; ${new Date().getFullYear()} JMP Foods Pty Ltd. All rights reserved.</p>
            <p>2/5 Clancys Rd, Mount Evelyn VIC 3796</p>
          </div>
        </div>
      `;
      
    } else if (emailType === "admin") {
      subject = `New Wholesale Order #${orderDetails.id} Received`;
      
      // Create HTML for admin order notification email
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #25a18e; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Order Received</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>A new wholesale order has been received.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> #${orderDetails.id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${orderDetails.userName}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'PayPal'}</p>
              <p><strong>Payment Status:</strong> ${orderDetails.paymentMethod === 'bank-transfer' ? 'Pending' : 'Paid'}</p>
            </div>
            
            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Product</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right;">$${(orderDetails.total - orderDetails.shippingOption.price).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Shipping (${orderDetails.shippingOption.name}):</td>
                  <td style="padding: 8px; text-align: right;">$${orderDetails.shippingOption.price.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">$${orderDetails.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Shipping Details</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
              <p style="margin: 0;">${orderDetails.shippingAddress.name}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.street}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}</p>
              <p style="margin: 0;">${orderDetails.shippingAddress.country}</p>
              <p style="margin: 0;">Phone: ${orderDetails.shippingAddress.phone}</p>
            </div>
            
            <p style="margin-top: 30px;">
              Please process this order at your earliest convenience.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>This is an automated message from your PP Protein Wholesale System</p>
          </div>
        </div>
      `;
    }
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from,
      to: [recipientEmail],
      subject,
      html
    });

    console.log("Email sent successfully:", emailResponse);

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
