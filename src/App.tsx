import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './shared/components/layout/Header';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/host" element={<HostSpacePage />} />
          <Route path="/admin-spaces" element={<AdminSpacesPage />} />

          <Route path="/test-roles" element={<TestRolesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/field/:id" element={<SportFieldDetailPage />} />
          <Route path="/sede/:id" element={<SedeDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<div className="p-8 text-center">Perfil de usuario - Próximamente</div>} />
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
