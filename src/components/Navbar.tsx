
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { customerItems, adminItems } from '@/components/sidebar/menuItems';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  
  // Load custom logo if available
  useEffect(() => {
    const savedLogo = localStorage.getItem('site_logo');
    if (savedLogo) {
      setSiteLogo(savedLogo);
    }
  }, []);

  return (
    <header className="bg-white text-gray-800 border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden text-gray-700 hover:text-[#25a18e] hover:bg-gray-100">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:max-w-sm p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Link to="/" className="inline-flex items-center">
                    {siteLogo ? (
                      <img src={siteLogo} alt="Site Logo" className="h-8" />
                    ) : (
                      <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" alt="PP Protein" className="h-8" onError={(e)=>{(e.target as HTMLImageElement).src='/favicon.ico';}} />
                    )}
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="px-2 py-3">
                <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Shop</div>
                <ul className="flex flex-col">
                  {(customerItems || []).map((item) => (
                    <li key={item.title}>
                      <SheetClose asChild>
                        {item.url.startsWith('http') ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100">
                            {React.createElement(item.icon, { className: 'h-5 w-5 text-gray-600' })}
                            <span className="text-gray-800">{item.title}</span>
                          </a>
                        ) : (
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100">
                            {React.createElement(item.icon, { className: 'h-5 w-5 text-gray-600' })}
                            <span className="text-gray-800">{item.title}</span>
                          </Link>
                        )}
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                {isAdmin && (
                  <>
                    <div className="px-2 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Admin</div>
                    <ul className="flex flex-col">
                      {(adminItems || []).map((item) => (
                        <li key={item.title}>
                          <SheetClose asChild>
                            {item.url.startsWith('http') ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100">
                                {React.createElement(item.icon, { className: 'h-5 w-5 text-gray-600' })}
                                <span className="text-gray-800">{item.title}</span>
                              </a>
                            ) : (
                              <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100">
                                {React.createElement(item.icon, { className: 'h-5 w-5 text-gray-600' })}
                                <span className="text-gray-800">{item.title}</span>
                              </Link>
                            )}
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="px-2 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Account</div>
                <div className="px-2 pb-4 flex gap-2">
                  {user ? (
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700" onClick={() => logout()}>Logout</Button>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-1/2 border-gray-300 text-gray-700">
                          <Link to="/login">Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="w-1/2 bg-[#25a18e] text-white hover:bg-[#1e8a77]">
                          <Link to="/signup">Sign Up</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="text-2xl font-bold flex items-center text-left">
            {siteLogo ? (
              <img src={siteLogo} alt="Site Logo" className="h-10" />
            ) : (
              <img src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=50" alt="PP Protein" className="h-10" onError={(e)=>{(e.target as HTMLImageElement).src='/favicon.ico';}} />
            )}
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#25a18e] hover:bg-gray-100">
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
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700 hover:text-[#25a18e] hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{profile?.business_name || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-200">
                  <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700">
                    <Link to="/profile" className="w-full">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700">
                    <Link to="/orders" className="w-full">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700">
                      <Link to="/admin" className="w-full">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="text-red-500 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
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
