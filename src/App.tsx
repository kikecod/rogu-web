import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import HostSpacePage from './pages/HostSpacePage';
import AdminSpacesPage from './pages/AdminSpacesPage';
import AboutUsPage from './pages/AboutUsPage';
import SportFieldDetailPage from './pages/SportFieldDetailPage';
import SedeDetailPage from './pages/SedeDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ControladorPage from './pages/ControladorPage';
import DenunciaPage from './pages/DenunciaPage';
import CalificaCPage from './pages/Califica';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ correo: string; avatar?: string } | undefined>();

  // Verificar si el usuario está logueado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(undefined);
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

  const handleLoginSuccess = (userData: { correo: string }) => {
    setIsLoggedIn(true);
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Header
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          user={user}
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
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/field/:id" element={<SportFieldDetailPage />} />
          <Route path="/sede/:id" element={<SedeDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<div className="p-8 text-center">Perfil de usuario - Próximamente</div>} />
          <Route path="/controlador" element={<ControladorPage />} />
          <Route path="/denuncia" element={<DenunciaPage />} />
          <Route path="/califica" element={<CalificaCPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
