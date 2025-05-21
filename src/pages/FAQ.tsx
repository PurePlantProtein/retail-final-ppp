
import React from 'react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const FAQ = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        <Separator className="my-4" />
        
        <div className="prose prose-gray max-w-none">
          <section>
            <h2 className="text-2xl font-semibold my-6">Ordering & Account</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a business account on retail.ppprotein.com.au?</AccordionTrigger>
                <AccordionContent>
                  Click "Register" or "Sign Up" on retail.ppprotein.com.au. Provide your business info (including ABN). Accounts are subject to review.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>I forgot my password. How can I reset it?</AccordionTrigger>
                <AccordionContent>
                  Click "Forgot Password?" on the login page.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Is there a minimum order quantity (MOQ) or value?</AccordionTrigger>
                <AccordionContent>
                  Some products may have MOQs, indicated on the product page. Minimum order value is $300 excluding shipping and GST.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How can I view my order history?</AccordionTrigger>
                <AccordionContent>
                  Log in and go to "My Account" or "Order History" on retail.ppprotein.com.au.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I add multiple users from my company to our business account?</AccordionTrigger>
                <AccordionContent>
                  Contact sales@ppprotein.com.au to discuss options for multiple users.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>How do I update my business or shipping information?</AccordionTrigger>
                <AccordionContent>
                  In "My Account" on retail.ppprotein.com.au. For ABN changes, contact sales@ppprotein.com.au.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Products & Pricing</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-7">
                <AccordionTrigger>How can I find product specifications for Pure Plant Protein products?</AccordionTrigger>
                <AccordionContent>
                  On each product page on retail.ppprotein.com.au. For more detailed information, contact sales@ppprotein.com.au.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger>Are prices inclusive of GST?</AccordionTrigger>
                <AccordionContent>
                  Prices are generally exclusive of GST. GST is added at checkout.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger>Do you offer volume discounts or contract pricing for Pure Plant Protein products?</AccordionTrigger>
                <AccordionContent>
                  Yes, volume discounts may apply. For contract pricing, contact our sales team at sales@ppprotein.com.au.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger>What if an item is out of stock?</AccordionTrigger>
                <AccordionContent>
                  The product page on retail.ppprotein.com.au will indicate this. You may sign up for notifications when the product is back in stock or contact sales@ppprotein.com.au for expected restock dates.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Payment</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-11">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept Visa, MasterCard, Amex, EFT, and approved credit accounts.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger>Is it safe to use my credit card on retail.ppprotein.com.au?</AccordionTrigger>
                <AccordionContent>
                  Yes, we use SSL encryption and a secure payment gateway. We don't store full credit card details.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-13">
                <AccordionTrigger>Can I apply for a credit account with Pure Plant Protein?</AccordionTrigger>
                <AccordionContent>
                  Eligible businesses can apply. Contact sales@ppprotein.com.au for details. Subject to credit check.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-14">
                <AccordionTrigger>How do I get a copy of my invoice?</AccordionTrigger>
                <AccordionContent>
                  Invoices are emailed upon order confirmation/dispatch, and available in "Order History" on retail.ppprotein.com.au.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Shipping & Delivery</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-15">
                <AccordionTrigger>What are your shipping costs and delivery times?</AccordionTrigger>
                <AccordionContent>
                  Shipping costs are calculated at checkout. Please see our Shipping Policy for detailed information on delivery times.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-16">
                <AccordionTrigger>How can I track my Pure Plant Protein order?</AccordionTrigger>
                <AccordionContent>
                  Track your order via the tracking link in your shipping confirmation email.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-17">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Yes, we ship internationally. Please note that duties, taxes, and customs fees are the customer's responsibility.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-18">
                <AccordionTrigger>What should I do if my order is damaged or incomplete?</AccordionTrigger>
                <AccordionContent>
                  Contact sales@ppprotein.com.au within 48 hours of delivery. Please refer to our Shipping Policy for more details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Returns & Refunds</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-19">
                <AccordionTrigger>What is your returns policy?</AccordionTrigger>
                <AccordionContent>
                  Returns for faulty goods are accepted. Change of mind returns are discretionary, may incur fees, and goods must be unused, in original packaging, and resalable.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-20">
                <AccordionTrigger>How do I initiate a return?</AccordionTrigger>
                <AccordionContent>
                  Contact sales@ppprotein.com.au with your order number and reason for the return.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Technical Support & App Usage</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-21">
                <AccordionTrigger>Who do I contact for technical issues with retail.ppprotein.com.au?</AccordionTrigger>
                <AccordionContent>
                  Contact sales@ppprotein.com.au for technical support issues.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-22">
                <AccordionTrigger>Is retail.ppprotein.com.au accessible on mobile devices?</AccordionTrigger>
                <AccordionContent>
                  Yes, our website retail.ppprotein.com.au is mobile-responsive for easy access on all devices.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold my-6">Security & Privacy</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-23">
                <AccordionTrigger>How is my business information protected?</AccordionTrigger>
                <AccordionContent>
                  We use security measures detailed in our Privacy Policy to protect your information.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-24">
                <AccordionTrigger>Where can I find your Privacy Policy?</AccordionTrigger>
                <AccordionContent>
                  Our Privacy Policy is available on our website. You can access it through the footer of any page.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          <div className="mt-12">
            <p className="text-lg">If your question isn't answered, contact Customer Support at <a href="mailto:sales@ppprotein.com.au" className="text-primary hover:underline">sales@ppprotein.com.au</a>.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
