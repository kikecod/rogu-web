import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFoundPage from './app/publico/pages/NotFoundPage';
import Header from './shared/components/layout/Header';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AuthModal from './features/auth/components/AuthModal';
import HomePage from './app/publico/pages/HomePage';
import HostSpacePage from './app/duenio/pages/HostSpacePage';
import AdminSpacesPage from './app/admin/pages/AdminSpacesPage';
import TestRolesPage from './app/admin/pages/TestRolesPage';
import { AuthProvider, useAuth, type User } from './features/auth/context/AuthContext';
import AboutUsPage from './app/publico/pages/AboutUsPage';
import SportFieldDetailPage from './app/publico/pages/SportFieldDetailPage';
import SedeDetailPage from './app/publico/pages/SedeDetailPage';
import CheckoutPage from './app/cliente/pages/CheckoutPage';
import BookingConfirmationPage from './app/cliente/pages/BookingConfirmationPage';
import MyBookingsPage from './app/cliente/pages/MyBookingsPage';
import { ROUTE_PATHS } from './constants';

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Opcional: recargar página para limpiar estado
    window.location.reload();
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleSwitchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  const handleLoginSuccess = (_userData: User) => {
    setIsAuthModalOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Header
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          onLogout={handleLogout}
        />
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          mode={authMode}
          onSwitchMode={handleSwitchAuthMode}
          onLoginSuccess={handleLoginSuccess}
        />

        <Routes>
          <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />
          <Route path={ROUTE_PATHS.HOST} element={
            <ProtectedRoute requiredRoles={["DUENIO"]}>
              <HostSpacePage />
            </ProtectedRoute>
          } />
          <Route path={ROUTE_PATHS.ADMIN_SPACES} element={
            <ProtectedRoute requiredRoles={["ADMIN"]}>
              <AdminSpacesPage />
            </ProtectedRoute>
          } />

          <Route path={ROUTE_PATHS.TEST_ROLES} element={<TestRolesPage />} />
          <Route path={ROUTE_PATHS.ABOUT} element={<AboutUsPage />} />
          <Route path={ROUTE_PATHS.SPORT_FIELD_DETAIL} element={<SportFieldDetailPage />} />
          <Route path={ROUTE_PATHS.SEDE_DETAIL} element={<SedeDetailPage />} />
          <Route path={ROUTE_PATHS.CHECKOUT} element={
            <ProtectedRoute requiredRoles={["CLIENTE"]}>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path={ROUTE_PATHS.BOOKING_CONFIRMATION} element={
            <ProtectedRoute requiredRoles={["CLIENTE"]}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          } />
          <Route path={ROUTE_PATHS.BOOKINGS} element={
            <ProtectedRoute requiredRoles={["CLIENTE"]}>
              <MyBookingsPage />
            </ProtectedRoute>
          } />
          <Route path={ROUTE_PATHS.PROFILE} element={
            <ProtectedRoute requiredRoles={["CLIENTE"]}>
              <div className="p-8 text-center">Perfil de usuario - Proximamente</div>
            </ProtectedRoute>
          } />
          {/* Catch-all: rutas no encontradas -> mostrar página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
