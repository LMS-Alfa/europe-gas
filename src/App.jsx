import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import GlobalStyles from './styles/GlobalStyles';
import ProtectedRoute from './components/ProtectedRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PartsUpload from './pages/admin/PartsUpload';
import UserManagement from './pages/admin/UserManagement';
import BonusReports from './pages/admin/BonusReports';
import UserDashboard from './pages/UserDashboard';
import { Layout } from './components/Layout';

// Animated route wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/parts" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <PartsUpload />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BonusReports />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Layout>
                <UserDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <GlobalStyles />
        <AuthProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
