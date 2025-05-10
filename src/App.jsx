import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import GlobalStyles from './styles/GlobalStyles';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PartsUpload from './pages/admin/PartsUpload';
import UserManagement from './pages/admin/UserManagement';
import BonusReports from './pages/admin/BonusReports';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';

// Animated route wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout title="Dashboard">
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/parts" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout title="Spare Parts">
                <PartsUpload />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout title="User Management">
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout title="Bonus Reports">
                <BonusReports />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* User Route - Unified Page */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="user">
              <Layout>
                <UserDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect old user routes to dashboard */}
        <Route path="/parts" element={<Navigate to="/dashboard" replace />} />
        <Route path="/history" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch All Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
