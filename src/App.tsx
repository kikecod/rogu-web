import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from '@/auth/components/AuthModal';
import HomePage from '@/search/pages/HomePage';
import HostSpacePage from '@/admin/pages/HostSpacePage';
import AdminSpacesPage from '@/admin/pages/AdminSpacesPage';
import TestRolesPage from '@/core/pages/TestRolesPage';
import ProfilePage from '@/user-profile/pages/ProfilePage';
import { AuthProvider } from '@/auth/states/AuthProvider';
import { useAuth, type User } from '@/auth/hooks/useAuth';
import AboutUsPage from '@/core/pages/AboutUsPage';
import FieldDetailPage from '@/fields/pages/FieldDetailPage';
import VenueDetailPage from '@/venues/pages/VenueDetailPage';
import CheckoutPage from '@/bookings/pages/CheckoutPage';
import BookingConfirmationPage from '@/bookings/pages/BookingConfirmationPage';
import MyBookingsPage from '@/bookings/pages/MyBookingsPage';
import FavoritesPage from './modules/favorites/pages/FavoritesPage';
import ProtectedRoute from '@/core/routing/ProtectedRoute';

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
          
          {/* Venue routes - Búsqueda por sedes */}
          <Route path="/venues/:idSede" element={<VenueDetailPage />} />
          <Route path="/venues/:idSede/fields/:idCancha" element={<FieldDetailPage />} />
          
          {/* Legacy routes - mantener compatibilidad */}
          <Route path="/field/:id" element={<FieldDetailPage />} />
          <Route path="/sede/:id" element={<VenueDetailPage />} />
          
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favoritos" element={<ProtectedRoute redirectTo="/" showUnauthorized={false}><FavoritesPage /></ProtectedRoute>} />
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
