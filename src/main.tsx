
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Security middleware for headers - simplified to avoid meta tag issues
if (typeof window !== 'undefined') {
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
    <App />
  </React.StrictMode>,
)
