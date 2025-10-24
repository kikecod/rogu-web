import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth, type User } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import HostSpacePage from './pages/HostSpacePage';
import AdminSpacesPage from './pages/AdminSpacesPage';
import TestRolesPage from './pages/TestRolesPage';
import AboutUsPage from './pages/AboutUsPage';
import SportFieldDetailPage from './pages/SportFieldDetailPage';
import SedeDetailPage from './pages/SedeDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ControladorDashboard from './pages/ControladorDashboard';
import DenunciaPage from './pages/DenunciaPage';
import CalificaCanchaPage from './pages/CalificaCanchaPage';


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

          <Route path="/controlador-dashboard" element={<ControladorDashboard />} />
          <Route path="/denuncia/:reportedId" element={<DenunciaPage />} />
          <Route path="/califica-cancha/:canchaId" element={<CalificaCanchaPage />} />
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
