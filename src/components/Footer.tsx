import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  
  // Load custom logo if available
  useEffect(() => {
    const savedLogo = localStorage.getItem('site_logo');
    if (savedLogo) {
      setSiteLogo(savedLogo);
    }
  }, []);

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-left">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              {siteLogo ? (
                <img src={siteLogo} alt="Site Logo" className="h-10" />
              ) : (
                <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" alt="PP Protein" className="h-10" />
              )}
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              Your trusted wholesale protein supplier for retail partners.
            </p>
            <div className="text-gray-500 text-sm space-y-1">
              <p>2/5 Clancys Rd, Mount Evelyn VIC 3796.</p>
              <p>0432590067</p>
              <p>hello@ppprotein.com.au</p>
            </div>
          </div>
          
          <div className="text-left">
            <h4 className="font-semibold mb-4 text-[#25a18e]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-left">
            <h4 className="font-semibold mb-4 text-[#25a18e]">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.ppprotein.com.au/pages/contact" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/faq" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-left">
            <h4 className="font-semibold mb-4 text-[#25a18e]">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-center text-gray-500">
          &copy; {new Date().getFullYear()} PPP Retailers. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
