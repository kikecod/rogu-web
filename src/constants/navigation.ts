import { ROUTE_PATHS } from './routes';

const MENU_LINK_BASE = 'block px-4 py-2 text-sm';

export const HEADER_MENU_LINK_CLASSES = {
  neutral: `${MENU_LINK_BASE} text-neutral-700 hover:bg-neutral-50`,
  success: `${MENU_LINK_BASE} text-green-700 hover:bg-green-50 font-medium`,
  purple: `${MENU_LINK_BASE} text-purple-700 hover:bg-purple-50`,
  blue: `${MENU_LINK_BASE} text-blue-700 hover:bg-blue-50`,
  gray: `${MENU_LINK_BASE} text-gray-700 hover:bg-gray-100`,
} as const;

export interface HeaderMenuLink {
  label: string;
  to: string;
  className?: string;
}

export const HEADER_MENU_LINKS = {
  ADMIN: [
    { label: 'Mi perfil', to: ROUTE_PATHS.PROFILE, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Administrar reservas', to: ROUTE_PATHS.ADMIN_RESERVATIONS, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Panel de Administracion', to: ROUTE_PATHS.ADMIN_SPACES, className: HEADER_MENU_LINK_CLASSES.success },
    { label: 'Prueba de Roles (Admin)', to: ROUTE_PATHS.TEST_ROLES, className: HEADER_MENU_LINK_CLASSES.purple },
  ],
  CLIENTE: [
    { label: 'Mi perfil', to: ROUTE_PATHS.PROFILE, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Mis reservas', to: ROUTE_PATHS.BOOKINGS, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Ofrece tu espacio', to: ROUTE_PATHS.HOST, className: HEADER_MENU_LINK_CLASSES.gray },
  ],
  CLIENTE_DUENIO: [
    { label: 'Mi perfil', to: ROUTE_PATHS.PROFILE, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Mis reservas', to: ROUTE_PATHS.BOOKINGS, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Panel de Administracion (Dueño)', to: ROUTE_PATHS.OWNER_DASHBOARD, className: HEADER_MENU_LINK_CLASSES.success },
  ],
  CLIENTE_CONTROLADOR: [
    { label: 'Mi perfil', to: ROUTE_PATHS.PROFILE, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Mis reservas', to: ROUTE_PATHS.BOOKINGS, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Escanear / Control de acceso', to: ROUTE_PATHS.CONTROL_SCAN, className: HEADER_MENU_LINK_CLASSES.blue },
    { label: 'Ofrece tu espacio', to: ROUTE_PATHS.HOST, className: HEADER_MENU_LINK_CLASSES.gray },
  ],
  CLIENTE_DUENIO_CONTROLADOR: [
    { label: 'Mi perfil', to: ROUTE_PATHS.PROFILE, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Mis reservas', to: ROUTE_PATHS.BOOKINGS, className: HEADER_MENU_LINK_CLASSES.neutral },
    { label: 'Panel de Administracion (Dueño)', to: ROUTE_PATHS.OWNER_DASHBOARD, className: HEADER_MENU_LINK_CLASSES.success },
    { label: 'Escanear / Control de acceso', to: ROUTE_PATHS.CONTROL_SCAN, className: HEADER_MENU_LINK_CLASSES.blue },
  ],
} as const;

export const HEADER_OPTIONAL_HOST_LINK: HeaderMenuLink = {
  label: 'Ofrece tu espacio',
  to: ROUTE_PATHS.HOST,
  className: HEADER_MENU_LINK_CLASSES.gray,
};

export interface FooterLink {
  label: string;
  to: string;
}

export const FOOTER_QUICK_LINKS: FooterLink[] = [
  { label: 'Buscar canchas', to: ROUTE_PATHS.SEARCH },
  { label: 'Ofrece tu espacio', to: ROUTE_PATHS.HOST },
  { label: 'Sobre nosotros', to: ROUTE_PATHS.ABOUT },
  { label: 'Como funciona', to: ROUTE_PATHS.HOW_IT_WORKS },
  { label: 'Preguntas frecuentes', to: ROUTE_PATHS.FAQ },
  { label: 'Ayuda', to: ROUTE_PATHS.HELP },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Terminos de servicio', to: ROUTE_PATHS.TERMS },
  { label: 'Politica de privacidad', to: ROUTE_PATHS.PRIVACY },
  { label: 'Cookies', to: ROUTE_PATHS.COOKIES },
];

// Links specifically for the "Acerca de" / company section in the footer
export const FOOTER_COMPANY_LINKS: FooterLink[] = [
  { label: 'Acerca de', to: ROUTE_PATHS.ABOUT },
  { label: 'Nuestra visión', to: ROUTE_PATHS.ABOUT_VISION },
  { label: 'Nuestra misión', to: ROUTE_PATHS.ABOUT_MISSION },
  { label: 'Contacto', to: ROUTE_PATHS.CONTACT },
  { label: 'Cómo funciona', to: ROUTE_PATHS.HOW_IT_WORKS },
];