import { useState, type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFoundPage from './app/publico/pages/NotFoundPage';
import Header from './shared/components/layout/Header';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AuthModal from './features/auth/components/AuthModal';
import HomePage from './app/publico/pages/HomePage';
import HostSpacePage from './app/user/duenio/pages/HostSpacePage';
import AdminSpacesPage from './app/admin/pages/AdminSpacesPage';
import TestRolesPage from './app/admin/pages/TestRolesPage';
import { AuthProvider, useAuth, type User } from './features/auth/context/AuthContext';
import AboutUsPage from './app/publico/pages/AboutUsPage';
import SportFieldDetailPage from './app/publico/pages/SportFieldDetailPage';
import SedeDetailPage from './app/publico/pages/SedeDetailPage';
import CheckoutPage from './app/user/cliente/pages/CheckoutPage';
import CheckoutSuccessPage from './app/user/cliente/pages/CheckoutSuccessPage';
import BookingConfirmationPage from './app/user/cliente/pages/BookingConfirmationPage';
import MyBookingsPage from './app/user/cliente/pages/MyBookingsPage';
import { ROUTE_PATHS, type AppRole } from './constants';
import OwnerDashboardPage from './app/user/duenio/pages/OwnerDashboardPage';
import OwnerVenueDetailPage from './app/user/duenio/pages/OwnerVenueDetailPage';
import OwnerCourtDetailPage from './app/user/duenio/pages/OwnerCourtDetailPage';
import OwnerVenuesPage from './app/user/duenio/pages/OwnerVenuesPage';
import OwnerVenueCreatePage from './app/user/duenio/pages/OwnerVenueCreatePage';
import OwnerReservationsPage from './app/user/duenio/pages/OwnerReservationsPage';

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Optional: reload the page to clear any local state or caches
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

  const handleLoginSuccess: (userData: User) => void = () => {
    setIsAuthModalOpen(false);
  };

  const publicRoutes: Array<{ path: string; element: JSX.Element }> = [
    { path: ROUTE_PATHS.HOME, element: <HomePage /> },
    { path: ROUTE_PATHS.ABOUT, element: <AboutUsPage /> },
    { path: ROUTE_PATHS.SPORT_FIELD_DETAIL, element: <SportFieldDetailPage /> },
    { path: ROUTE_PATHS.SEDE_DETAIL, element: <SedeDetailPage /> },
    { path: ROUTE_PATHS.TEST_ROLES, element: <TestRolesPage /> },
  ];

  const protectedRoutes: Array<{
    path: string;
    element: JSX.Element;
    roles: AppRole[];
  }> = [
    { path: ROUTE_PATHS.HOST, element: <HostSpacePage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.OWNER_DASHBOARD, element: <OwnerDashboardPage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.OWNER_VENUES, element: <OwnerVenuesPage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.OWNER_VENUE_CREATE, element: <OwnerVenueCreatePage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.OWNER_VENUE_DETAIL, element: <OwnerVenueDetailPage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.OWNER_COURT_DETAIL, element: <OwnerCourtDetailPage />, roles: ['DUENIO'] },
  { path: ROUTE_PATHS.OWNER_RESERVATIONS, element: <OwnerReservationsPage />, roles: ['DUENIO'] },
    { path: ROUTE_PATHS.ADMIN_SPACES, element: <AdminSpacesPage />, roles: ['ADMIN'] },
    { path: ROUTE_PATHS.CHECKOUT, element: <CheckoutPage />, roles: ['CLIENTE'] },
    { path: ROUTE_PATHS.CHECKOUT_SUCCESS, element: <CheckoutSuccessPage />, roles: ['CLIENTE'] },
    { path: ROUTE_PATHS.BOOKING_CONFIRMATION, element: <BookingConfirmationPage />, roles: ['CLIENTE'] },
    { path: ROUTE_PATHS.BOOKINGS, element: <MyBookingsPage />, roles: ['CLIENTE'] },
    {
      path: ROUTE_PATHS.PROFILE,
      element: <div className="p-8 text-center">Perfil de usuario - Proximamente</div>,
      roles: ['CLIENTE'],
    },
  ];

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
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {protectedRoutes.map(({ path, element, roles }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute requiredRoles={roles}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

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
