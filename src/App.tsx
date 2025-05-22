
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import './App.css';

// Pages
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Cart from '@/pages/Cart';
import OrderSuccess from '@/pages/OrderSuccess';
import Orders from '@/pages/Orders';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import ProductsManagement from '@/pages/Admin/ProductsManagement';
import CategoriesManagement from '@/pages/Admin/CategoriesManagement';
import ProductImport from '@/pages/Admin/ProductImport';
import UsersManagement from '@/pages/Admin/UsersManagement';
import OrdersManagement from '@/pages/Admin/OrdersManagement';
import AnalyticsManagement from '@/pages/Admin/AnalyticsManagement';
import SettingsManagement from '@/pages/Admin/SettingsManagement';
import ShippingSettings from '@/pages/Admin/ShippingSettings';
import EmailSettings from '@/pages/Admin/EmailSettings';
import Marketing from '@/pages/Marketing';
import MarketingMaterialsManagement from '@/pages/Admin/MarketingMaterialsManagement';
import NotFound from '@/pages/NotFound';
import FAQ from '@/pages/FAQ';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import ShippingPolicy from '@/pages/ShippingPolicy';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              
              {/* Protected routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />

              {/* Admin routes - fixed requireAdmin to requiresAdmin */}
              <Route path="/admin" element={<ProtectedRoute requiresAdmin><Admin /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requiresAdmin><ProductsManagement /></ProtectedRoute>} />
              <Route path="/admin/products/import" element={<ProtectedRoute requiresAdmin><ProductImport /></ProtectedRoute>} />
              <Route path="/admin/products/categories" element={<ProtectedRoute requiresAdmin><CategoriesManagement /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requiresAdmin><OrdersManagement /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiresAdmin><UsersManagement /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requiresAdmin><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiresAdmin><SettingsManagement /></ProtectedRoute>} />
              <Route path="/admin/settings/shipping" element={<ProtectedRoute requiresAdmin><ShippingSettings /></ProtectedRoute>} />
              <Route path="/admin/email-settings" element={<ProtectedRoute requiresAdmin><EmailSettings /></ProtectedRoute>} />
              <Route path="/admin/marketing" element={<ProtectedRoute requiresAdmin><MarketingMaterialsManagement /></ProtectedRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
