
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";

// Security middleware for headers
if (typeof window !== 'undefined') {
  // Set security headers using meta tags
  const createSecurityMeta = (name: string, content: string) => {
    const meta = document.createElement('meta');
    meta.httpEquiv = name;
    meta.content = content;
    document.head.appendChild(meta);
  };

  // Content Security Policy - allow images from any source
  createSecurityMeta(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.gpteng.co 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://*.lovable.app; img-src 'self' data: https://*.supabase.co https://* blob:; style-src 'self' 'unsafe-inline';"
  );

  // Prevent XSS attacks
  createSecurityMeta('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  createSecurityMeta('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  createSecurityMeta('X-Frame-Options', 'DENY');
  
  // Enforce HTTPS
  createSecurityMeta('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Remove Lovable badge after the app loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const lovableBadge = document.getElementById('toEditThisSite');
      if (lovableBadge) {
        lovableBadge.style.display = 'none';
      }
    }, 100);
  });
  
  // Set the favicon from localStorage if it exists
  const savedIcon = localStorage.getItem('site_icon');
  if (savedIcon) {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = savedIcon;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
