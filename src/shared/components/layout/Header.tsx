// src/shared/layout/header/Header.tsx
import React, { useState } from 'react';
import { Search, Menu, User, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import roguLogo from '../../../assets/img/rogu_logo.png';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { ROUTE_PATHS, getPathsForRoles } from '../../../constants';

import HeaderAdminMenu from './Header.Admin';
import HeaderClienteMenu from './Header.Cliente';
import HeaderClienteDuenioMenu from './Header.ClienteDuenio';
import HeaderClienteControladorMenu from './Header.ClienteControlador';
import HeaderClienteDuenioControladorMenu from './Header.ClienteDuenioControlador';

type Role = 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const has = (roles: Role[] | undefined, r: Role) => !!roles?.includes(r);
const hasAll = (roles: Role[] | undefined, needed: Role[]) => needed.every(n => has(roles, n));

const pickVariant = (roles: Role[] | undefined) => {
  if (has(roles, 'ADMIN')) return 'ADMIN';
  // todas las combinaciones ricas primero
  if (hasAll(roles, ['CLIENTE', 'DUENIO', 'CONTROLADOR'])) return 'CLIENTE_DUENIO_CONTROLADOR';
  if (hasAll(roles, ['DUENIO', 'CONTROLADOR'])) return 'CLIENTE_DUENIO_CONTROLADOR'; // sin CLIENTE igual mostramos ese menú combinado
  if (hasAll(roles, ['CLIENTE', 'DUENIO'])) return 'CLIENTE_DUENIO';
  if (hasAll(roles, ['CLIENTE', 'CONTROLADOR'])) return 'CLIENTE_CONTROLADOR';
  // roles individuales
  if (has(roles, 'DUENIO')) return 'CLIENTE_DUENIO';
  if (has(roles, 'CONTROLADOR')) return 'CLIENTE_CONTROLADOR';
  if (has(roles, 'CLIENTE')) return 'CLIENTE';
  // fallback visual para anónimos (usa menú de login)
  return 'ANON';
};

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, isDuenio } = useAuth();
  const allowedPaths = getPathsForRoles((user?.roles || []) as Role[], { includePublic: true, includeAuth: false });
  const [searchQuery, setSearchQuery] = useState('');
  
  const getUserInitial = (): string => {
    const primary = typeof user?.correo === 'string' ? user?.correo : undefined;
    const secondary = typeof user?.usuario === 'string' ? user?.usuario : undefined;
    const label = (primary ?? secondary ?? '').trim();
    const ch = label ? label.charAt(0) : '';
    return ch ? ch.toUpperCase() : '';
  };

  const closeMenu = () => setIsMenuOpen(false);
  const variant = pickVariant((user?.roles || []) as Role[]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to={ROUTE_PATHS.HOME} className="flex items-center min-w-0">
            <img src={roguLogo} alt="ROGU" className="h-8 sm:h-10 w-auto" />
            <span className="hidden sm:block ml-2 text-xs sm:text-sm text-neutral-600 truncate">ROGÜ</span>
          </Link>

          {/* Search (lg+) */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-4 xl:mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 xl:h-5 xl:w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 xl:pl-10 pr-3 py-2 text-sm border border-neutral-300 rounded-full bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar canchas deportivas..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Small public nav (only show links the user can access) */}
            <div className="hidden lg:flex space-x-4 mr-2">
              {allowedPaths.EXPLORE && (
                <Link to={allowedPaths.EXPLORE} className="text-sm text-neutral-600 hover:text-blue-600">
                  Explorar
                </Link>
              )}
              {allowedPaths.SEARCH && (
                <Link to={allowedPaths.SEARCH} className="text-sm text-neutral-600 hover:text-blue-600">
                  Buscar
                </Link>
              )}
            </div>

            <button className="hidden sm:block p-2 text-neutral-500 hover:text-neutral-700">
              <Globe className="h-4 w-4" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 border border-neutral-300 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 hover:shadow-md hover:border-neutral-400"
              >
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
                {isLoggedIn && user ? (
                  user.avatar ? (
                    <img src={user.avatar} alt={(typeof user.correo === 'string' && user.correo) || (typeof user.usuario === 'string' && user.usuario) || 'Usuario'} className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
                  ) : (
                    (() => {
                      const initial = getUserInitial();
                      return initial ? (
                        <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {initial}
                        </div>
                      ) : (
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                      );
                    })()
                  )
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                )}
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-xl py-2 z-50 border border-neutral-200">
                  {isLoggedIn && user && variant !== 'ANON' ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{(typeof user?.correo === 'string' && user.correo) || (typeof user?.usuario === 'string' && user.usuario) || 'Usuario'}</p>
                        {user?.roles?.length ? (
                          <p className="text-xs text-blue-600 mt-1">Roles: {user.roles.join(', ')}</p>
                        ) : null}
                      </div>

                      {variant === 'ADMIN' && (
                        <HeaderAdminMenu user={user} closeMenu={closeMenu} onLogout={onLogout} isDuenio={isDuenio} />
                      )}
                      {variant === 'CLIENTE' && (
                        <HeaderClienteMenu user={user} closeMenu={closeMenu} onLogout={onLogout} isDuenio={isDuenio} />
                      )}
                      {variant === 'CLIENTE_DUENIO' && (
                        <HeaderClienteDuenioMenu user={user} closeMenu={closeMenu} onLogout={onLogout} isDuenio={isDuenio} />
                      )}
                      {variant === 'CLIENTE_CONTROLADOR' && (
                        <HeaderClienteControladorMenu user={user} closeMenu={closeMenu} onLogout={onLogout} isDuenio={isDuenio} />
                      )}
                      {variant === 'CLIENTE_DUENIO_CONTROLADOR' && (
                        <HeaderClienteDuenioControladorMenu user={user} closeMenu={closeMenu} onLogout={onLogout} isDuenio={isDuenio} />
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { closeMenu(); onSignupClick(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      >
                        Registrarse
                      </button>
                      <button
                        onClick={() => { closeMenu(); onLoginClick(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Iniciar sesión
                      </button>
                      <hr className="my-1" />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Buscar canchas deportivas..."
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
