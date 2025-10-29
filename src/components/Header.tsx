import React, { useState } from 'react';
import { Search, Menu, User, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import roguLogo from '@/assets/rogu_logo.png';
import { useAuth } from '@/auth/hooks/useAuth';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, isDuenio } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center min-w-0">
            <img 
              src={roguLogo} 
              alt="ROGU" 
              className="h-8 sm:h-10 w-auto"
            />
            <span className="hidden sm:block ml-2 text-xs sm:text-sm text-neutral-600 truncate">
              ROGÜ
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-4 xl:mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 xl:h-5 xl:w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 xl:pl-10 pr-3 py-2 text-sm border border-neutral-300 rounded-full leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Buscar canchas deportivas..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Host your space link */}
            {!isDuenio() && (
              <Link
                to="/host"
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
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 border border-neutral-300 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 hover:shadow-md transition-all duration-200 hover:border-neutral-400"
              >
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
                {isLoggedIn && user ? (
                  user.avatar ? (
                    <img src={user.avatar} alt={user.correo} className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
                  ) : (
                    <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.correo.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                )}
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-xl py-2 z-50 border border-neutral-200">
                  {isLoggedIn ? (
                    <>
                      {/* Información del usuario */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.correo}
                        </p>
                        {user?.roles && user.roles.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Roles: {user.roles.join(', ')}
                          </p>
                        )}
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mi perfil
                      </Link>
                      <Link
                        to="/bookings"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mis reservas
                      </Link>
                      
                      {/* Solo mostrar para dueños y admins */}
                      {user?.roles && (user.roles.includes('DUENIO') || user.roles.includes('ADMIN')) && (
                        <Link
                          to="/admin-spaces"
                          className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Panel de Administración
                        </Link>
                      )}
                      
                      {/* Solo mostrar para admins */}
                      {user?.roles && user.roles.includes('ADMIN') && (
                        <Link
                          to="/test-roles"
                          className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Prueba de Roles (Admin)
                        </Link>
                      )}
                      
                      {/* Solo mostrar "Ofrece tu espacio" si NO es dueño */}
                      {!isDuenio() && (
                        <Link
                          to="/host"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Ofrece tu espacio
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSignupClick();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      >
                        Registrarse
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLoginClick();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Iniciar sesión
                      </button>
                      <hr className="my-1" />
                      <Link
                        to="/host"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ofrece tu espacio
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Buscar canchas deportivas..."
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;