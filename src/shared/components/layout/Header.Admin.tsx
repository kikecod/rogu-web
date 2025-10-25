// src/shared/layout/header/Header.Admin.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HEADER_MENU_LINKS } from '../../../constants';

export interface RoleMenuProps {
  user: any;
  closeMenu: () => void;
  onLogout: () => void;
  isDuenio: () => boolean;
}

const HeaderAdminMenu: React.FC<RoleMenuProps> = ({ user, closeMenu, onLogout }) => {
  return (
    <>
      {/* Información del usuario */}
      {user?.correo && (
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">{user.correo}</p>
        </div>
      )}

      {HEADER_MENU_LINKS.ADMIN.map((link) => (
        <Link key={link.to} to={link.to} className={link.className} onClick={closeMenu}>
          {link.label}
        </Link>
      ))}

      
      <hr className="my-1" />
      <button
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
        onClick={() => { closeMenu(); onLogout(); }}
      >
        Cerrar sesión
      </button>
    </>
  );
};

export default HeaderAdminMenu;
