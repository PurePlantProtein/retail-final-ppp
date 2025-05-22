
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
import FAQ from "./pages/FAQ";
import ShippingPolicy from "./pages/ShippingPolicy";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Navigate to="/products" replace />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/products/:id" 
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/faq" 
                  element={
                    <ProtectedRoute>
                      <FAQ />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/shipping" 
                  element={
                    <ProtectedRoute>
                      <ShippingPolicy />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/terms" 
                  element={
                    <ProtectedRoute>
                      <Terms />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/privacy" 
                  element={
                    <ProtectedRoute>
                      <Privacy />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/products" 
                  element={
                    <ProtectedRoute>
                      <ProductsManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/products/import" 
                  element={
                    <ProtectedRoute>
                      <ProductImport />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/products/categories" 
                  element={
                    <ProtectedRoute>
                      <CategoriesManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute>
                      <UsersManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/users/approvals" 
                  element={
                    <ProtectedRoute>
                      <UsersManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute>
                      <AnalyticsManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
