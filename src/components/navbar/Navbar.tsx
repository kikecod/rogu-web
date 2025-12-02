
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { useMode } from '../../core/hooks/useMode';
import { ROUTES } from '@/config/routes';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { AdminTabBar } from '../../modules/core/navigation/AdminTabBar';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Navbar = ({ onLoginClick, onSignupClick, onLogout }: NavbarProps) => {
  const { isDuenio, isAdmin, user } = useAuth();
  const { mode, toggleMode } = useMode();

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Verificar si el usuario puede cambiar a modo dueño (solo DUENIO, no ADMIN)
  const canSwitchToOwnerMode = isDuenio() && !isAdmin();

  // Manejar cambio de modo
  const handleModeToggle = () => {
    toggleMode();
    // Navegar a home para que HomeRouter decida qué mostrar
    navigate(ROUTES.home);
  };

  // Manejar click en logo según rol y modo
  const handleLogoClick = () => {
    // 1. ADMIN siempre va a su dashboard
    if (isAdmin()) {
      navigate(ROUTES.admin.dashboard);
      return;
    }
    
    // 2. DUENIO en modo dueño va a owner dashboard
    if (isDuenio() && mode === 'duenio') {
      navigate(ROUTES.owner.dashboard);
      return;
    }
    
    // 3. En cualquier otro caso (CLIENTE o modo cliente) va a home
    navigate(ROUTES.home);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-gray-100 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo onClick={handleLogoClick} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón de cambio de modo para DUENIO/ADMIN */}
            {canSwitchToOwnerMode && (
              <button
                onClick={handleModeToggle}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                <RefreshCw className="h-4 w-4" />
                {mode === 'duenio' ? 'Modo Cliente' : 'Modo Dueño'}
              </button>
            )}

            {/* "Ofrece tu espacio" solo si NO es dueño/admin */}
            {!canSwitchToOwnerMode && (
              <Link
                to={ROUTES.owner.hostSpace}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <Plus className="h-4 w-4" />
                Ofrece tu espacio
              </Link>
            )}

            {/* Login button for guests */}
            {!user && (
              <button
                onClick={onLoginClick}
                className="hidden sm:block px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </button>
            )}

            {/* User menu */}
            <div className="pl-2 border-l border-gray-200 ml-2">
              <UserMenu
                onLoginClick={onLoginClick}
                onSignupClick={onSignupClick}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tab Bar - Solo visible en rutas admin */}
      {isAdminRoute && user?.roles && user.roles.includes('ADMIN') && (
        <div className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <AdminTabBar />
        </div>
      )}

    </header>
  );
};

export default Navbar;
