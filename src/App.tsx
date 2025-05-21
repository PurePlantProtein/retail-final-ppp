
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProductImport from "./pages/Admin/ProductImport";
import ProductsManagement from "./pages/Admin/ProductsManagement";
import CategoriesManagement from "./pages/Admin/CategoriesManagement";
import UsersManagement from "./pages/Admin/UsersManagement";
import SettingsManagement from "./pages/Admin/SettingsManagement";
import AnalyticsManagement from "./pages/Admin/AnalyticsManagement";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/products" replace />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/products" element={<ProductsManagement />} />
                  <Route path="/admin/products/import" element={<ProductImport />} />
                  <Route path="/admin/products/categories" element={<CategoriesManagement />} />
                  <Route path="/admin/users" element={<UsersManagement />} />
                  <Route path="/admin/users/approvals" element={<UsersManagement />} />
                  <Route path="/admin/settings" element={<SettingsManagement />} />
                  <Route path="/admin/analytics" element={<AnalyticsManagement />} />
                  <Route path="/admin/orders" element={<Orders />} />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
