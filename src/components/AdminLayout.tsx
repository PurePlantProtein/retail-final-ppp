
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Package, Users, BarChart3, Mail, Truck, DollarSign, FileText } from 'lucide-react';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'Analytics', 
      path: '/admin/analytics', 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      name: 'Email Settings', 
      path: '/admin/email-settings', 
      icon: <Mail className="h-5 w-5" /> 
    },
    { 
      name: 'Marketing Materials', 
      path: '/admin/marketing', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      name: 'Pricing Tiers', 
      path: '/admin/pricing-tiers', 
      icon: <DollarSign className="h-5 w-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      name: 'Shipping Settings', 
      path: '/admin/shipping-settings', 
      icon: <Truck className="h-5 w-5" /> 
    }
  ];
  
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background md:border-r p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`) 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
