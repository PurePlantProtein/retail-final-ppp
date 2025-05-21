
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#051c2c] text-white border-t border-[#0a253e] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">
              <img src="https://ppprotein.com.au/cdn/shop/files/ppprotein-white_180x.png" alt="PP Protein" className="h-8" />
            </h3>
            <p className="text-gray-300 text-sm">
              Your trusted wholesale protein supplier for retail partners.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-[#f0ba00]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#f0ba00]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-[#f0ba00]">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-[#f0ba00]">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-[#f0ba00]">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[#f0ba00]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-[#f0ba00]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-[#f0ba00]">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-[#f0ba00]">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-[#f0ba00]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-[#f0ba00]">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#0a253e] mt-8 pt-6 text-sm text-center text-gray-300">
          &copy; {new Date().getFullYear()} PP Protein Wholesale. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
