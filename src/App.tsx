
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import { ShippingProvider } from "@/contexts/ShippingContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProductsManagement from "./pages/Admin/ProductsManagement";
import UsersManagement from "./pages/Admin/UsersManagement";
import OrdersManagement from "./pages/Admin/OrdersManagement";
import OrderDetail from "./pages/Admin/OrderDetail";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ShippingPolicy from "./pages/ShippingPolicy";
import Marketing from "./pages/Marketing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SignupSuccess from "./pages/SignupSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import ApprovedRoute from "./components/ApprovedRoute";
import AnalyticsManagement from "./pages/Admin/AnalyticsManagement";
import MarketingMaterialsManagement from "./pages/Admin/MarketingMaterialsManagement";
import ProductImport from "./pages/Admin/ProductImport";
import SettingsManagement from "./pages/Admin/SettingsManagement";
import EmailSettings from "./pages/Admin/EmailSettings";
import BulkOrderEmails from "./pages/Admin/BulkOrderEmails";
import PricingTiersManagement from "./pages/Admin/PricingTiersManagement";
import ShippingSettings from "./pages/Admin/ShippingSettings";
import CategoriesManagement from "./pages/Admin/CategoriesManagement";
import BusinessTypesManagement from "./pages/Admin/BusinessTypesManagement";
import SampleOrders from "./pages/Admin/SampleOrders";
import SiteAssets from "./pages/Admin/SiteAssets";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <SidebarProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <ShippingProvider>
                    <CartProvider>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/signup-success" element={<SignupSuccess />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                        <Route path="/marketing" element={<Marketing />} />
                        
                        {/* Protected Routes */}
                        <Route
                          path="/products"
                          element={
                            <ProtectedRoute>
                              <ApprovedRoute>
                                <Products />
                              </ApprovedRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/products/:id"
                          element={
                            <ProtectedRoute>
                              <ApprovedRoute>
                                <ProductDetail />
                              </ApprovedRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <ApprovedRoute>
                                <Cart />
                              </ApprovedRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <ApprovedRoute>
                                <Orders />
                              </ApprovedRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/order-success"
                          element={
                            <ProtectedRoute>
                              <ApprovedRoute>
                                <OrderSuccess />
                              </ApprovedRoute>
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
                          path="/admin/users"
                          element={
                            <ProtectedRoute>
                              <UsersManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <ProtectedRoute>
                              <OrdersManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/sample-orders"
                          element={
                            <ProtectedRoute>
                              <SampleOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/orders/:id"
                          element={
                            <ProtectedRoute>
                              <OrderDetail />
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
                          path="/admin/marketing"
                          element={
                            <ProtectedRoute>
                              <MarketingMaterialsManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/import"
                          element={
                            <ProtectedRoute>
                              <ProductImport />
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
                          path="/admin/email-settings"
                          element={
                            <ProtectedRoute>
                              <EmailSettings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/bulk-order-emails"
                          element={
                            <ProtectedRoute>
                              <BulkOrderEmails />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/pricing-tiers"
                          element={
                            <ProtectedRoute>
                              <PricingTiersManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/shipping"
                          element={
                            <ProtectedRoute>
                              <ShippingSettings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/categories"
                          element={
                            <ProtectedRoute>
                              <CategoriesManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/business-types"
                          element={
                            <ProtectedRoute>
                              <BusinessTypesManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/site-assets"
                          element={
                            <ProtectedRoute>
                              <SiteAssets />
                            </ProtectedRoute>
                          }
                        />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </CartProvider>
                  </ShippingProvider>
                </AuthProvider>
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
