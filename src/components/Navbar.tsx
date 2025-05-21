
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="bg-gradient-to-r from-[#212529] to-[#343a40] text-white border-b border-[#495057] sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" alt="PP Protein" className="h-10" />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-white hover:text-[#25a18e] transition-colors">
            Products
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-[#25a18e] transition-colors">
              Admin Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-white hover:text-[#25a18e] hover:bg-[#495057]/30">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#25a18e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:text-[#25a18e] hover:bg-[#495057]/30">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{profile?.business_name || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#343a40] border-[#495057] text-white">
                  <DropdownMenuItem asChild className="hover:bg-[#495057] focus:bg-[#495057] text-white">
                    <Link to="/profile" className="w-full">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-[#495057] focus:bg-[#495057] text-white">
                    <Link to="/orders" className="w-full">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="hover:bg-[#495057] focus:bg-[#495057] text-white">
                      <Link to="/admin" className="w-full">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="text-[#ff4d6d] hover:bg-[#495057] focus:bg-[#495057]">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" asChild className="text-white border-white hover:bg-[#495057]/50 hover:text-white">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#25a18e] text-white hover:bg-[#1e8a77]">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
