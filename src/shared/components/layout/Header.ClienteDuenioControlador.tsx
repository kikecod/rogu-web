// src/shared/layout/header/Header.ClienteDuenioControlador.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HEADER_MENU_LINKS } from '../../../constants';
import type { RoleMenuProps } from './Header.Admin';

const HeaderClienteDuenioControladorMenu: React.FC<RoleMenuProps> = ({ closeMenu, onLogout }) => {
  return (
    <>
      {HEADER_MENU_LINKS.CLIENTE_DUENIO_CONTROLADOR.map((link) => (
        <Link key={link.to} to={link.to} className={link.className} onClick={closeMenu}>
          {link.label}
        </Link>
      ))}

      <hr className="my-1" />
      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
        onClick={() => { closeMenu(); onLogout(); }}>
        Cerrar sesión
      </button>
    </>
  );
};

export default HeaderClienteDuenioControladorMenu;
