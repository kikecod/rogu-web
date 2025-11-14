import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from '@/auth/components/AuthModal';
import HomePage from '@/search/pages/HomePage';
import SearchDemoPage from '@/search/pages/SearchDemoPage';

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
import HostSpacePage from './modules/admin-owner/pages/HostSpacePage';
import AdminSpacesPage from './modules/admin-owner/pages/AdminSpacesPage';
import AdminLayout from '@/admin-panel/layout/AdminLayout';
import { ROUTES } from '@/config/routes';

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
    <div className="App">
      {/* Header principal SIEMPRE visible */}
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
        
        {/* Venue routes - Búsqueda por sedes */}
        <Route path={ROUTES.venuePattern} element={<VenueDetailPage />} />
        <Route path={ROUTES.venueFieldPattern} element={<FieldDetailPage />} />
        
        {/* Legacy routes - mantener compatibilidad */}
        <Route path={ROUTES.fieldPattern} element={<FieldDetailPage />} />
        <Route path={ROUTES.sedePattern} element={<VenueDetailPage />} />
        
        <Route path={ROUTES.checkout} element={<CheckoutPage />} />
        <Route path={ROUTES.bookingConfirmationPattern} element={<BookingConfirmationPage />} />
        <Route path={ROUTES.bookingConfirmationBase} element={<BookingConfirmationPage />} />
        <Route path={ROUTES.bookings} element={<MyBookingsPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
        <Route path={ROUTES.favoritos} element={<ProtectedRoute redirectTo={ROUTES.home} showUnauthorized={false}><FavoritesPage /></ProtectedRoute>} />
        
        {/* Rutas del Panel de Administración con AdminLayout */}
        <Route path={ROUTES.admin.dashboard} element={<AdminLayout><NewDashboardPage /></AdminLayout>} />
        <Route path={ROUTES.admin.usuarios} element={<AdminLayout><UsuariosListPage /></AdminLayout>} />
        <Route path={ROUTES.admin.sedes} element={<AdminLayout><SedesListPage /></AdminLayout>} />
        
        {/* Rutas de Dueños */}
        <Route path={ROUTES.owner.hostSpace} element={<HostSpacePage />} />
        <Route path={ROUTES.owner.adminSpaces} element={<AdminSpacesPage />} />
        
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
