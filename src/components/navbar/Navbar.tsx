import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { AdminTabBar } from '@/core/navigation/AdminTabBar';
import Logo from './Logo';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Navbar = ({ onLoginClick, onSignupClick, onLogout }: NavbarProps) => {
  const { isDuenio, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Detectar si estamos en rutas admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Logo />

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Host your space link */}
            {!isDuenio() && (
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

            {/* User menu */}
            <UserMenu 
              onLoginClick={onLoginClick}
              onSignupClick={onSignupClick}
              onLogout={onLogout}
            />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Admin Tab Bar - Solo visible en rutas admin */}
      {isAdminRoute && user?.roles && user.roles.includes('ADMIN') && (
        <AdminTabBar />
      )}
    </header>
  );
};

export default Navbar;
