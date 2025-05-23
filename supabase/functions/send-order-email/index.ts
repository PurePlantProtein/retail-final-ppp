
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
  template?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails, emailType, recipientEmail, template }: OrderEmailRequest = await req.json();

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
    
    // Use provided template if available, otherwise use default template
    htmlContent = template || `<h1>${subject}</h1><p>Order details: ${JSON.stringify(orderDetails)}</p>`;
    
    // Simple templating system for the email
    htmlContent = processTemplate(htmlContent, orderDetails);

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

// Process template for handlebars-like syntax
function processTemplate(template: string, order: any): string {
  let result = template;

  // Replace simple variables
  const variables = [
    'id', 'orderId', 'userId', 'userName', 'email', 'total', 'paymentMethod', 
    'invoiceStatus', 'invoiceUrl', 'notes', 'status'
  ];

  // Map orderId to id if needed
  if (order.id && !order.orderId) {
    order.orderId = order.id;
  }

  variables.forEach(variable => {
    result = result.replace(
      new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
      order[variable] || ''
    );
  });

  // Handle nested objects like shippingAddress
  if (order.shippingAddress) {
    const addressFields = ['name', 'street', 'city', 'state', 'postalCode', 'country', 'phone'];
    addressFields.forEach(field => {
      result = result.replace(
        new RegExp(`\\{\\{shippingAddress.${field}\\}\\}`, 'g'),
        order.shippingAddress[field] || ''
      );
    });
  }
  
  // Handle each loops for items
  const eachItemsRegex = /\{\{#each items\}\}([\s\S]*?)\{\{\/each\}\}/g;
  const itemMatches = result.match(eachItemsRegex);
  
  if (itemMatches && order.items && Array.isArray(order.items)) {
    itemMatches.forEach(match => {
      const template = match.replace(/\{\{#each items\}\}/, '').replace(/\{\{\/each\}\}/, '');
      let replacement = '';
      
      order.items.forEach((item: any) => {
        let itemHtml = template;
        
        // Replace product properties
        if (item.product) {
          Object.keys(item.product).forEach(key => {
            itemHtml = itemHtml.replace(
              new RegExp(`\\{\\{product.${key}\\}\\}`, 'g'),
              item.product[key] || ''
            );
          });
        }
        
        // Replace item quantity
        itemHtml = itemHtml.replace(/\{\{quantity\}\}/g, item.quantity || '');
        
        replacement += itemHtml;
      });
      
      result = result.replace(match, replacement);
    });
  }
  
  return result;
}

serve(handler);
