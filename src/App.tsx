
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/contexts/CartContext';
import { ShippingProvider } from '@/contexts/ShippingContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import SignupSuccess from '@/pages/SignupSuccess';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import OrderSuccess from '@/pages/OrderSuccess';
import Marketing from '@/pages/Marketing';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import FAQ from '@/pages/FAQ';
import NotFound from '@/pages/NotFound';

// Admin pages
import Admin from '@/pages/Admin';
import ProductsManagement from '@/pages/Admin/ProductsManagement';
import UsersManagement from '@/pages/Admin/UsersManagement';
import AnalyticsManagement from '@/pages/Admin/AnalyticsManagement';
import EmailSettings from '@/pages/Admin/EmailSettings';
import SettingsManagement from '@/pages/Admin/SettingsManagement';
import ShippingSettings from '@/pages/Admin/ShippingSettings';
import PricingTiersManagement from '@/pages/Admin/PricingTiersManagement';
import OrdersManagement from '@/pages/Admin/OrdersManagement';
import OrderDetail from '@/pages/Admin/OrderDetail';
import CategoriesManagement from '@/pages/Admin/CategoriesManagement';
import MarketingMaterialsManagement from '@/pages/Admin/MarketingMaterialsManagement';
import ProductImport from '@/pages/Admin/ProductImport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ShippingProvider>
              <ThemeProvider defaultTheme="light">
                <Toaster />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/signup-success" element={<SignupSuccess />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/faq" element={<FAQ />} />

                  {/* Protected routes */}
                  <Route path="/products" element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } />
                  <Route path="/products/:id" element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/order-success" element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  } />
                  <Route path="/marketing" element={
                    <ProtectedRoute>
                      <Marketing />
                    </ProtectedRoute>
                  } />

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requiresAdmin>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products" element={
                    <ProtectedRoute requiresAdmin>
                      <ProductsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiresAdmin>
                      <UsersManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requiresAdmin>
                      <AnalyticsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/email-settings" element={
                    <ProtectedRoute requiresAdmin>
                      <EmailSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requiresAdmin>
                      <SettingsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/shipping-settings" element={
                    <ProtectedRoute requiresAdmin>
                      <ShippingSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/pricing-tiers" element={
                    <ProtectedRoute requiresAdmin>
                      <PricingTiersManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <ProtectedRoute requiresAdmin>
                      <OrdersManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders/:id" element={
                    <ProtectedRoute requiresAdmin>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/categories" element={
                    <ProtectedRoute requiresAdmin>
                      <CategoriesManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/marketing-materials" element={
                    <ProtectedRoute requiresAdmin>
                      <MarketingMaterialsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/product-import" element={
                    <ProtectedRoute requiresAdmin>
                      <ProductImport />
                    </ProtectedRoute>
                  } />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ThemeProvider>
            </ShippingProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
