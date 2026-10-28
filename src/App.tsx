import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SupabaseSetupBanner } from './components/common/SupabaseSetupBanner';
import { RealtimeNotification } from './components/common/RealtimeNotification';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { OffersPage } from './pages/OffersPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Wrapper to conditionally hide Navbar and Footer on admin screens
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          {/* Supabase backend status banner */}
          <SupabaseSetupBanner />

          {/* Realtime live notification popup */}
          <RealtimeNotification />

          <CustomerLayout>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/policies" element={<PoliciesPage />} />

              {/* Owner Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Owner Admin Protected Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardOverview />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                <Route path="offers" element={<AdminOffersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Catch all: redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CustomerLayout>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
