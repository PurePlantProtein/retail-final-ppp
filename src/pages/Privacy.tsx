
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <Separator className="my-4" />
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: May 21, 2025</p>
          
          <p>AUSTRALIAN PLANT PROTEINS PTY LTD (ABN 21 615 704 302 / ACN 615 704 302), trading as Pure Plant Protein ("We", "Us", "Our"), is committed to protecting the privacy of the personal information of our business customers ("You", "Your", "User") who use the retail.ppprotein.com.au B2B e-commerce platform ("App" or "Website"), and related services (collectively, the "Services").</p>
          
          <p className="mt-3">This Privacy Policy outlines how we collect, use, disclose, and manage personal information in compliance with the Australian Privacy Principles (APPs) set out in the Privacy Act 1988 (Cth) (Privacy Act).</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. What is Personal Information?</h2>
          <p>"Personal Information" means information or an opinion about an identified individual, or an individual who is reasonably identifiable. In our B2B context, this primarily relates to individuals representing the businesses we interact with.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. What Personal Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identity and Contact Details: Name, job title, business email address (e.g., provided to sales@ppprotein.com.au), business phone number, business address.</li>
            <li>Account Information: Username, password (hashed), account preferences, order history.</li>
            <li>Transaction Information: Details of products/services purchased, payment information, shipping/billing addresses.</li>
            <li>Communications: Records of communications (emails to sales@ppprotein.com.au, etc.).</li>
            <li>Technical Information: IP address, browser type, usage data (collected via cookies on retail.ppprotein.com.au).</li>
            <li>Marketing Preferences.</li>
            <li>Information You Voluntarily Provide.</li>
          </ul>
          <p>We generally do not collect sensitive information.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Collect Personal Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Directly from You: When your business registers, orders, contacts sales@ppprotein.com.au, subscribes.</li>
            <li>Automatically: Via cookies and server logs when you use retail.ppprotein.com.au.</li>
            <li>From Third Parties: Other representatives in your business, publicly available sources, our service providers.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Why We Collect, Use, and Disclose Personal Information (Purposes)</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To Provide and Manage Our Services: Account creation, order processing, customer support via sales@ppprotein.com.au, payments, shipping.</li>
            <li>To Improve Our Services: Analyzing use of retail.ppprotein.com.au, developing new products.</li>
            <li>For Communication and Marketing: Service updates, marketing (with opt-in/as permitted).</li>
            <li>For Legal and Compliance Purposes: Complying with Australian law, preventing fraud, enforcing Terms.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Disclosure of Personal Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service Providers: Payment gateways, shipping companies, IT/cloud providers, marketing platforms.</li>
            <li>Your Business: Other authorized representatives.</li>
            <li>Professional Advisors: Lawyers, accountants.</li>
            <li>Regulatory Bodies and Law Enforcement: As required by law.</li>
            <li>Business Transfer: In case of merger/acquisition.</li>
            <li>With Your Consent.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Cross-Border Disclosure of Personal Information</h2>
          <p>Some service providers may be overseas. We take reasonable steps to ensure overseas recipients handle data per APPs.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Cookies and Similar Technologies</h2>
          <p>We use cookies on retail.ppprotein.com.au for functionality, preferences, analytics, and targeted advertising (with consent). You can control cookies via browser settings.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Data Security</h2>
          <p>We take reasonable steps (physical, electronic, procedural safeguards, SSL) to protect personal information. However, no internet transmission is 100% secure.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Your Rights and Choices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access & Correction: Request access to or correction of your data by contacting sales@ppprotein.com.au.</li>
            <li>Opt-out of Marketing: Use unsubscribe links or contact us.</li>
            <li>Making a Complaint: Contact us first.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Data Retention</h2>
          <p>We retain personal information as long as necessary for the purposes collected, or for legal/reporting requirements.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to This Privacy Policy</h2>
          <p>Updates will be posted on retail.ppprotein.com.au. Review periodically.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Us & Complaints</h2>
          <p>If you have questions or complaints, contact our Privacy Officer:</p>
          <p className="mt-2">Privacy Officer<br />
          Pure Plant Protein / AUSTRALIAN PLANT PROTEINS PTY LTD<br />
          ABN: 21 615 704 302<br />
          ⅖ Clancys Road Mount Evelyn<br />
          Email: sales@ppprotein.com.au</p>
          
          <p className="mt-4">If unsatisfied, contact the Office of the Australian Information Commissioner (OAIC).</p>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Note on GDPR/CCPA</h3>
          <p>Our primary focus is the Australian Privacy Act. If you believe other regulations apply to your interactions with Pure Plant Protein, please contact us.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
