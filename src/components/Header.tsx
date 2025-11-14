import React, { useState } from 'react';
import { Menu, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import roguLogo from '@/assets/rogu_logo.png';
import { useAuth } from '@/auth/hooks/useAuth';
import { getImageUrl } from '@/core/config/api';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, isDuenio } = useAuth();

  return (
    <header className="bg-white shadow-md border-b-2 border-primary-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center min-w-0 group">
            <img 
              src={roguLogo} 
              alt="ROGU" 
              className="h-10 sm:h-14 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block ml-3">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                ROGÜ
              </span>
              <p className="text-xs text-gray-500 -mt-1">Tu cancha ideal</p>
            </div>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">

            {/* HOST TU ESPACIO */}
            {!isDuenio() && (
              <Link
                to="/host"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 border-2 border-primary-500 rounded-full hover:bg-primary-50 transition-all whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" />
                Ofrece tu espacio
              </Link>
            )}

            {/* LOGIN BUTTON */}
            {!isLoggedIn && (
              <button
                onClick={onLoginClick}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-full hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md hover:shadow-lg"
              >
                <User className="h-4 w-4" />
                Iniciar Sesión
              </button>
            )}

            {/* USER MENU */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 border border-neutral-300 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 hover:shadow-md transition-all duration-200 hover:border-neutral-400"
              >
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
                {isLoggedIn && user ? (
                  user.avatar ? (
                    <img
                      src={
                        user.avatar.startsWith("http")
                          ? user.avatar
                          : getImageUrl(user.avatar)
                      }
                      alt={user.correo}
                      className="h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.correo.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                )}
              </button>

              {/* DROPDOWN */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-xl py-2 z-50 border border-neutral-200">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.correo}
                        </p>
                        {user?.roles && user.roles.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Roles: {user.roles.join(", ")}
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

                      <Link
                        to="/favoritos"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mis canchas favoritas
                      </Link>

                      {/* OWNER + ADMIN */}
                      {user?.roles?.some(r => r === "DUENIO" || r === "ADMIN") && (
                        <Link
                          to="/admin-spaces"
                          className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Panel de Administración
                        </Link>
                      )}

                      {/* ADMIN */}
                      {user?.roles?.includes("ADMIN") && (
                        <Link
                          to="/test-roles"
                          className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Prueba de Roles (Admin)
                        </Link>
                      )}

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
      </div>
    </header>
  );
};

export default Header;