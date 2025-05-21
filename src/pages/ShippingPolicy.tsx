
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';

const ShippingPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
        <Separator className="my-4" />
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: May 21, 2025</p>
          
          <p>This Shipping Policy outlines the shipping procedures and guidelines for orders placed through the retail.ppprotein.com.au B2B e-commerce platform ("App" or "Website") operated by Pure Plant Protein / JMP Foods Pty Ltd (ABN 21 615 704 302) ("We", "Us", "Our"). This policy applies to all business customers ("You", "Your", "Customer") using our App/Website.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Order Processing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing Times: Orders are typically processed within 2-7 business days (Monday to Friday, excluding public holidays) after payment confirmation and order verification.</li>
            <li>Order Confirmation: You will receive an order confirmation email to sales@ppprotein.com.au (or the email used for the order) once your order has been successfully placed and payment is confirmed.</li>
            <li>Order Cut-Off Times: Orders received after 2:00pm AEST/AEDT on a business day may be processed on the next business day.</li>
            <li>Business Accounts: All orders must be placed through a registered and approved business account on the App/Website. We reserve the right to verify business credentials.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Shipping Methods and Delivery Times</h2>
          <h3 className="text-lg font-medium mt-4 mb-2">Domestic Shipping (Australia)</h3>
          <p>We offer the following shipping methods within Australia:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standard Shipping: Estimated delivery within 3-7 business days after dispatch.</li>
            <li>Express Shipping: Estimated delivery within 1-3 business days after dispatch (available for eligible orders and locations).</li>
            <li>Bulk Freight/Pallet Delivery: For large orders, specific arrangements will be made, and delivery times will be quoted separately.</li>
          </ul>
          
          <p className="mt-3">Delivery times are estimates and commence from the date of dispatch, not the date of order. We are not liable for delays caused by courier partners or unforeseen circumstances beyond our reasonable control.</p>

          <h3 className="text-lg font-medium mt-4 mb-2">International Shipping</h3>
          <p>Customers are responsible for all applicable import duties, taxes, and customs fees levied by the destination country. These charges are not included in the order total or shipping costs paid to Us.</p>
          
          <p className="mt-3">Shipping Carriers: We partner with reputable carriers such as Australia Post, StarTrack, TNT, or various trusted freight providers. The carrier used will depend on the order size, weight, destination, and shipping method selected.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Shipping Costs</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Shipping costs are calculated based on the weight, dimensions, destination of your order, and the selected shipping method.</li>
            <li>Shipping costs will be displayed at checkout before you complete your order.</li>
            <li>For bulk orders or special freight requirements, shipping costs will be provided as a separate quotation by contacting sales@ppprotein.com.au.</li>
            <li>We may offer free shipping on order in Australia when they purchase over 6 units of 750g bags. Or during specific promotional periods. Terms and conditions for such promotions will be clearly stated.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Shipping Restrictions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We ship to valid business addresses. We may not be able to ship to PO Boxes for certain types of goods or large orders.</li>
            <li>Some products may be subject to shipping restrictions due to their nature. Any such restrictions will be noted on the product page or communicated prior to order confirmation.</li>
            <li>We reserve the right to refuse shipment to certain locations if deemed unserviceable or high-risk by our shipping partners.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Order Tracking</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Once your order is dispatched, you will receive a shipping confirmation email containing a tracking number and a link to the carrier's website to monitor your delivery status.</li>
            <li>Tracking information may take up to 24 hours to become active in the carrier's system after dispatch.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Undeliverable Packages / Failed Deliveries</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>If a package is returned to us as undeliverable due to an incorrect address provided by you, refusal to accept the delivery, or failure to collect from the carrier, you may be responsible for re-delivery costs.</li>
            <li>For B2B deliveries, ensure authorized personnel are available to receive goods during business hours. Missed deliveries may incur re-delivery fees or require collection from a depot, as per the carrier's policy.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Damaged or Lost Packages</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Please inspect all goods immediately upon receipt.</li>
            <li>If your order arrives damaged, please notify us within 3 business days of delivery by contacting sales@ppprotein.com.au with your order number and photographic evidence of the damage.</li>
            <li>If your order is deemed lost in transit (i.e., not delivered within a reasonable timeframe beyond the estimated delivery date and confirmed lost by the carrier), please contact us at sales@ppprotein.com.au.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Title and Risk of Loss</h2>
          <p>Title to the goods and risk of loss or damage passes to you upon delivery of the goods to the carrier for shipment. For certain agreed freight terms (e.g., Incoterms for international shipments), these conditions may vary and will be specified in your order agreement or quotation.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to Shipping Policy</h2>
          <p>We reserve the right to modify this Shipping Policy at any time. Any changes will be effective immediately upon posting the updated policy on our App/Website.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
          <p>For any questions or concerns regarding this Shipping Policy, please contact us at:</p>
          <p className="mt-2">Pure Plant Protein / JMP FOODS PTY LTD<br />
          ⅖ Clancys Road Mount Evelyn<br />
          Email: sales@ppprotein.com.au</p>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
