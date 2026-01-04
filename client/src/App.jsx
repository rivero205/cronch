import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Expenses from './pages/Expenses';
import Production from './pages/Production';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Businesses from './pages/Businesses';
import BusinessesAdmin from './pages/BusinessesAdmin';
import Users from './pages/Users';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterWithInvitation from './pages/RegisterWithInvitation';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Role-based Protected Route Component
function RoleProtectedRoute({ children, allowedRoles }) {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterWithInvitation />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/production" element={<Production />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin and Super Admin only routes */}
                <Route
                  path="/reports"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin', 'super_admin']}>
                      <Reports />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/businesses"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Businesses />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/businesses-admin"
                  element={
                    <RoleProtectedRoute allowedRoles={['super_admin']}>
                      <BusinessesAdmin />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin', 'super_admin']}>
                      <Users />
                    </RoleProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
