import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Page components
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';

import './App.css';

const AppLayout = () => {
  const { pathname } = useLocation();
  const isAdminLogin = pathname === '/secure-admin-login';
  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/secure-admin-dashboard');
  const isAdminPortal = isAdminLogin || isAdminDashboard;

  useEffect(() => {
    document.title = isAdminLogin
      ? 'AllStore | Admin Login'
      : isAdminDashboard
        ? 'AllStore | Admin Dashboard'
        : 'AllStore | Online Shopping';
  }, [isAdminDashboard, isAdminLogin]);

  return (
    <div className={`app-container${isAdminPortal ? ' admin-portal-shell' : ''}`}>
      {!isAdminPortal && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/track"
            element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/track-order" element={<Navigate to="/orders" replace />} />
          <Route path="/admin/orders" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          <Route path="/secure-admin-login" element={<AdminLoginPage />} />
          <Route
            path="/secure-admin-dashboard/*"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/secure-admin-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPortal && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}

export default App;
