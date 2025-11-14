import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from '@/auth/components/AuthModal';
import HomePage from '@/search/pages/HomePage';

// Página que existía SOLO en Task3Bau
import SearchDemoPage from '@/search/pages/SearchDemoPage';

// Páginas que existían SOLO en dev
import HostSpacePage from '@/admin/pages/HostSpacePage';
import AdminSpacesPage from '@/admin/pages/AdminSpacesPage';

// Duplicadas pero también existen en modules/admin-owner → renombramos para no romper
import HostSpaceOwnerPage from './modules/admin-owner/pages/HostSpacePage';
import AdminSpacesOwnerPage from './modules/admin-owner/pages/AdminSpacesPage';

import TestRolesPage from '@/core/pages/TestRolesPage';
import ProfilePage from '@/user-profile/pages/ProfilePage';
import { AuthProvider } from '@/auth/states/AuthProvider';
import { useAuth, type User } from '@/auth/hooks/useAuth';
import AboutUsPage from '@/core/pages/AboutUsPage';
import HowItWorksPage from '@/core/pages/HowItWorksPage';
import FAQPage from '@/core/pages/FAQPage';
import TermsPage from '@/core/pages/TermsPage';
import FieldDetailPage from '@/fields/pages/FieldDetailPage';
import VenueDetailPage from '@/venues/pages/VenueDetailPage';
import CheckoutPage from '@/bookings/pages/CheckoutPage';
import BookingConfirmationPage from '@/bookings/pages/BookingConfirmationPage';
import MyBookingsPage from '@/bookings/pages/MyBookingsPage';
import FavoritesPage from './modules/favorites/pages/FavoritesPage';
import ProtectedRoute from '@/core/routing/ProtectedRoute';

import NewDashboardPage from '@/admin-panel/dashboard/pages/NewDashboardPage';
import UsuariosListPage from '@/admin-panel/usuarios/pages/UsuariosListPage';
import SedesListPage from '@/admin-panel/sedes/pages/SedesListPage';
import AdminLayout from '@/admin-panel/layout/AdminLayout';
import { ROUTES } from '@/config/routes';

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.searchDemo} element={<SearchDemoPage />} />

        <Route path={ROUTES.testRoles} element={<TestRolesPage />} />

        {/* Páginas públicas */}
        <Route path={ROUTES.about} element={<AboutUsPage />} />
        <Route path={ROUTES.howItWorks} element={<HowItWorksPage />} />
        <Route path={ROUTES.faq} element={<FAQPage />} />
        <Route path={ROUTES.terms} element={<TermsPage />} />

        {/* Venue y fields */}
        <Route path={ROUTES.venuePattern} element={<VenueDetailPage />} />
        <Route path={ROUTES.venueFieldPattern} element={<FieldDetailPage />} />

        {/* Legacy */}
        <Route path={ROUTES.fieldPattern} element={<FieldDetailPage />} />
        <Route path={ROUTES.sedePattern} element={<VenueDetailPage />} />

        {/* Booking */}
        <Route path={ROUTES.checkout} element={<CheckoutPage />} />
        <Route path={ROUTES.bookingConfirmationPattern} element={<BookingConfirmationPage />} />
        <Route path={ROUTES.bookingConfirmationBase} element={<BookingConfirmationPage />} />

        <Route path={ROUTES.bookings} element={<MyBookingsPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />

        {/* Favoritos PROTEGIDO */}
        <Route
          path={ROUTES.favoritos}
          element={
            <ProtectedRoute redirectTo={ROUTES.home} showUnauthorized={false}>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Panel de administración */}
        <Route
          path={ROUTES.admin.dashboard}
          element={
            <AdminLayout>
              <NewDashboardPage />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.admin.usuarios}
          element={
            <AdminLayout>
              <UsuariosListPage />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.admin.sedes}
          element={
            <AdminLayout>
              <SedesListPage />
            </AdminLayout>
          }
        />

        {/* Rutas Dueños (owner) */}
        <Route path={ROUTES.owner.hostSpace} element={<HostSpaceOwnerPage />} />
        <Route path={ROUTES.owner.adminSpaces} element={<AdminSpacesOwnerPage />} />

        {/* Rutas Admin anteriores del branch dev */}
        <Route path="/host" element={<HostSpacePage />} />
        <Route path="/admin-spaces" element={<AdminSpacesPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;