
import React from 'react';
import { Link } from 'react-router-dom';
import Testimonials from './Testimonials';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 mt-auto">
      <Testimonials />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" alt="PP Protein" className="h-10" />
            </h3>
            <p className="text-gray-500 text-sm">
              Your trusted wholesale protein supplier for retail partners.
            </p>
          </div>
          
          <div>
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
          
          <div>
            <h4 className="font-semibold mb-4 text-[#25a18e]">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-[#25a18e] transition-colors">
                  Contact Us
                </Link>
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
          
          <div>
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
          &copy; {new Date().getFullYear()} PP Protein Wholesale. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
