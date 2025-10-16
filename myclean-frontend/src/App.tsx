import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Customer Pages
import SearchProviders from './pages/customer/SearchProviders';
import ProviderProfile from './pages/customer/ProviderProfile';
import MyBookings from './pages/customer/MyBookings';
import Payment from './pages/customer/Payment';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import AvailabilityCalendar from './pages/provider/AvailabilityCalendar';
import Messages from './pages/provider/Messages';
import PaymentTracking from './pages/provider/PaymentTracking';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Other Pages
import Verification from './pages/Verification';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route
              path="/search"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <SearchProviders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/:id"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <ProviderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Payment />
                </ProtectedRoute>
              }
            />

            {/* Provider Routes */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/calendar"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <AvailabilityCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/messages"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/payments"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <PaymentTracking />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <Verification />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Redirect based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on role
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
  return <Navigate to="/search" replace />;
};

export default App;
