
import { Link, useNavigate } from 'react-router-dom';
import { Globe, RefreshCw } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { useMode } from '../../core/hooks/useMode';
import { ROUTES } from '@/config/routes';
import Logo from './Logo';
import UserMenu from './UserMenu';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Navbar = ({ onLoginClick, onSignupClick, onLogout }: NavbarProps) => {
  const { isDuenio, isAdmin, user } = useAuth();
  const { mode, toggleMode } = useMode();

  const navigate = useNavigate();

  // Verificar si el usuario puede cambiar a modo dueño (solo DUENIO, no ADMIN)
  const canSwitchToOwnerMode = isDuenio() && !isAdmin();

  // Manejar cambio de modo
  const handleModeToggle = () => {
    toggleMode();
    // Navegar a home para que HomeRouter decida qué mostrar
    navigate(ROUTES.home);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Logo />

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Botón de cambio de modo para DUENIO/ADMIN */}
            {canSwitchToOwnerMode && (
              <button
                onClick={handleModeToggle}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-lg transition-all shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                {mode === 'duenio' ? 'Modo Cliente' : 'Modo Dueño'}
              </button>
            )}

            {/* "Ofrece tu espacio" solo si NO es dueño/admin */}
            {!canSwitchToOwnerMode && (
              <Link
                to={ROUTES.owner.hostSpace}
                className="hidden lg:block text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                Ofrece tu espacio
              </Link>
            )}

            {/* Language selector - hidden on small screens */}
            <button className="hidden sm:block p-2 text-neutral-500 hover:text-neutral-700 transition-colors">
              <Globe className="h-4 w-4" />
            </button>

            {/* Login button for guests */}
            {!user && (
              <button
                onClick={onLoginClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                Iniciar Sesión
              </button>
            )}

            {/* User menu */}
            <UserMenu
              onLoginClick={onLoginClick}
              onSignupClick={onSignupClick}
              onLogout={onLogout}
            />
          </div>
        </div>


      </div>

    </header>
  );
};

export default Navbar;
