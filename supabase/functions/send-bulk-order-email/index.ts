
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkOrderEmailRequest {
  type: 'send_bulk' | 'submit_order';
  subject?: string;
  message?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
  scheduleRecurring?: boolean;
  // For order submission
  retailerId?: string;
  orderItems?: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { type, subject, message, products, scheduleRecurring, retailerId, orderItems, notes }: BulkOrderEmailRequest = await req.json();

    if (type === 'send_bulk') {
      // Get all approved retailers
      const { data: retailers, error: retailersError } = await supabase
        .from('profiles')
        .select('id, email, business_name')
        .eq('approval_status', 'approved')
        .not('email', 'is', null);

      if (retailersError) throw retailersError;

      // If scheduling is enabled, set up the recurring job
      if (scheduleRecurring) {
        console.log('Setting up 30-day recurring email schedule...');
        
        // Create a cron job for 30-day recurring emails
        // This would run every 30 days at midnight
        const { error: cronError } = await supabase.rpc('create_bulk_email_schedule', {
          schedule_name: 'bulk_order_emails_30_day',
          cron_expression: '0 0 */30 * *', // Every 30 days at midnight
          email_config: {
            subject,
            message,
            products
          }
        });

        if (cronError) {
          console.error('Failed to create recurring schedule:', cronError);
          // Continue with sending the current email even if scheduling fails
        } else {
          console.log('Successfully created 30-day recurring email schedule');
        }
      }

      const emailPromises = retailers.map(async (retailer) => {
        const orderFormHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #25a18e; padding: 20px; text-align: center;">
              <img src="https://ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" alt="PP Protein" style="height: 40px;">
            </div>
            
            <div style="padding: 30px 20px;">
              <h1 style="margin-top: 0; color: #25a18e;">${subject || 'New Products Available for Order'}</h1>
              
              <p>Hi ${retailer.business_name},</p>
              
              ${message ? `<p>${message}</p>` : ''}
              
              <h2 style="color: #333;">Featured Products</h2>
              
              <form action="${Deno.env.get('SUPABASE_URL')}/functions/v1/send-bulk-order-email" method="POST" style="margin-top: 20px;">
                <input type="hidden" name="type" value="submit_order">
                <input type="hidden" name="retailerId" value="${retailer.id}">
                
                ${products?.map(product => `
                  <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center;">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">` : ''}
                    <div style="flex: 1;">
                      <h3 style="margin: 0 0 5px 0; font-size: 16px;">${product.name}</h3>
                      <p style="margin: 5px 0; font-weight: bold; color: #25a18e;">$${product.price.toFixed(2)}</p>
                      <div style="margin-top: 10px;">
                        <label style="font-size: 14px; margin-right: 10px;">Quantity:</label>
                        <input 
                          type="number" 
                          name="quantity_${product.id}" 
                          min="0" 
                          max="999"
                          style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;"
                          placeholder="0"
                        >
                      </div>
                    </div>
                  </div>
                `).join('') || ''}
                
                <div style="margin-top: 20px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">Special Instructions or Notes:</label>
                  <textarea 
                    name="notes" 
                    rows="3" 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif;"
                    placeholder="Any special requirements or notes for this order..."
                  ></textarea>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <button 
                    type="submit" 
                    style="background-color: #25a18e; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block;"
                  >
                    Submit Order
                  </button>
                </div>
              </form>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="font-size: 14px; color: #666;">
                  You can also visit our website to browse the full catalog: 
                  <a href="https://d73a9acb-fe77-4ec3-aa5d-b97e819d7fc6.lovableproject.com/products" style="color: #25a18e;">Browse Products</a>
                </p>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777;">
              <p>&copy; ${new Date().getFullYear()} PP Protein. All rights reserved.</p>
              ${scheduleRecurring ? '<p style="margin-top: 5px;">This is part of our monthly product update series.</p>' : ''}
            </div>
          </div>
        `;

        return resend.emails.send({
          from: "PP Protein Orders <orders@retail.ppprotein.com.au>",
          to: [retailer.email],
          subject: subject || 'New Products Available for Order',
          html: orderFormHtml
        });
      });

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`Bulk email sent: ${successful} successful, ${failed} failed`);

      return new Response(JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed: failed,
        schedulingEnabled: scheduleRecurring
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === 'submit_order') {
      // Handle order submission from email
      if (!retailerId || !orderItems) {
        throw new Error('Missing retailer ID or order items');
      }

      // Get retailer details
      const { data: retailer, error: retailerError } = await supabase
        .from('profiles')
        .select('business_name, email')
        .eq('id', retailerId)
        .single();

      if (retailerError) throw retailerError;

      // Get product details for the ordered items
      const productIds = orderItems.map(item => item.productId);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Calculate total
      let total = 0;
      const orderDetails = orderItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && item.quantity > 0) {
          const lineTotal = product.price * item.quantity;
          total += lineTotal;
          return {
            product,
            quantity: item.quantity,
            lineTotal
          };
        }
        return null;
      }).filter(Boolean);

      if (orderDetails.length === 0) {
        throw new Error('No valid items in order');
      }

      // Send confirmation email to retailer
      const retailerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #25a18e; padding: 20px; text-align: center;">
            <img src="https://ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" alt="PP Protein" style="height: 40px;">
          </div>
          
          <div style="padding: 30px 20px;">
            <h1 style="margin-top: 0; color: #25a18e;">Order Submitted Successfully</h1>
            
            <p>Hi ${retailer.business_name},</p>
            
            <p>Thank you for your order! We have received the following items:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.map(item => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.product.name}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.product.price.toFixed(2)}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.lineTotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #ddd;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #ddd;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            
            <p>Our sales team will contact you shortly to confirm the order and arrange delivery.</p>
            
            <p>Thank you for your business!</p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: "PP Protein Orders <orders@retail.ppprotein.com.au>",
        to: [retailer.email],
        subject: 'Order Confirmation - PP Protein',
        html: retailerEmailHtml
      });

      // Send notification to sales team
      const salesEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1>New Email Order Received</h1>
          
          <p><strong>Customer:</strong> ${retailer.business_name} (${retailer.email})</p>
          
          <h3>Order Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.product.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.product.price.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.lineTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #ddd;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #ddd;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${notes ? `<p><strong>Customer Notes:</strong> ${notes}</p>` : ''}
          
          <p>Please follow up with the customer to confirm and process this order.</p>
        </div>
      `;

      await resend.emails.send({
        from: "PP Protein Orders <orders@retail.ppprotein.com.au>",
        to: ["sales@ppprotein.com.au"],
        subject: `New Email Order from ${retailer.business_name}`,
        html: salesEmailHtml
      });

      return new Response(JSON.stringify({ success: true, message: 'Order submitted successfully' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in send-bulk-order-email function:", error);
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
