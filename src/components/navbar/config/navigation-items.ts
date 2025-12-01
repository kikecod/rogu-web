import { ROUTES } from '@/config/routes';
import { User, Calendar, Heart, Building2, Store, LayoutDashboard, Users, CheckCircle, Settings } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: React.ElementType;
  roles?: string[]; // Si no tiene roles, es para todos
  hideFor?: string[]; // Ocultar para estos roles
  showOnlyWhen?: (user: any) => boolean; // Función personalizada
}

/**
 * Navegación común para todos los usuarios autenticados (excepto ADMIN)
 */
export const commonNavigation: NavigationItem[] = [
  {
    id: 'profile',
    label: 'Mi perfil',
    route: ROUTES.profile,
    icon: User,
    hideFor: ['ADMIN'],
  },
  {
    id: 'bookings',
    label: 'Mis reservas',
    route: ROUTES.bookings,
    icon: Calendar,
    hideFor: ['ADMIN'],
  },
  {
    id: 'favorites',
    label: 'Mis favoritos',
    route: ROUTES.favoritos,
    icon: Heart,
    hideFor: ['ADMIN'],
  },
];

/**
 * Navegación de acceso rápido a paneles según rol
 */
export const panelNavigation: NavigationItem[] = [
  {
    id: 'admin-panel',
    label: 'Panel de Administración',
    route: ROUTES.admin.dashboard,
    icon: Building2,
    roles: ['ADMIN'], // Solo para ADMIN
  },
  {
    id: 'owner-panel',
    label: 'Mis Espacios',
    route: ROUTES.owner.adminSpaces,
    icon: Building2,
    roles: ['DUENIO'], // Solo para DUEÑO
  },
];

/**
 * Pestañas/Tabs de navegación para ADMIN (submenu detallado)
 */
export const adminTabsNavigation: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    route: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    id: 'admin-usuarios',
    label: 'Usuarios',
    route: ROUTES.admin.usuarios,
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    id: 'admin-sedes',
    label: 'Sedes',
    route: ROUTES.admin.sedes,
    icon: Building2,
    roles: ['ADMIN'],
  },
  {
    id: 'admin-verificaciones',
    label: 'Verificaciones',
    route: ROUTES.admin.verificaciones,
    icon: CheckCircle,
    roles: ['ADMIN'],
  },
];

/**
 * Pestañas/Tabs de navegación para DUEÑO (submenu detallado)
 */
export const ownerTabsNavigation: NavigationItem[] = [
  {
    id: 'owner-dashboard',
    label: 'Dashboard',
    route: ROUTES.owner.dashboard,
    icon: LayoutDashboard,
    roles: ['DUENIO'],
  },
  {
    id: 'owner-spaces',
    label: 'Mis Espacios',
    route: ROUTES.owner.adminSpaces,
    icon: Building2,
    roles: ['DUENIO'],
  },
  {
    id: 'owner-resenas',
    label: 'Reseñas',
    route: ROUTES.owner.resenas,
    icon: Heart,
    roles: ['DUENIO'],
  },
  {
    id: 'owner-settings',
    label: 'Configuración',
    route: ROUTES.profile,
    icon: Settings,
    roles: ['DUENIO'],
  },
];

/**
 * Navegación adicional (puede ser para todos o con condiciones)
 */
export const additionalNavigation: NavigationItem[] = [
  {
    id: 'host-space',
    label: 'Ofrece tu espacio',
    route: ROUTES.owner.hostSpace,
    icon: Store,
    hideFor: ['DUENIO'], // Ocultar si ya es dueño
  },
];

/**
 * Helper para filtrar navegación según roles del usuario
 */
export const filterNavigationByRole = (
  items: NavigationItem[],
  userRoles: string[] = [],
  user?: any
): NavigationItem[] => {
  return items.filter((item) => {
    // Si tiene hideFor, verificar que el usuario NO tenga esos roles
    if (item.hideFor) {
      const hasHiddenRole = item.hideFor.some((role) => userRoles.includes(role));
      if (hasHiddenRole) return false;
    }

    // Si tiene roles requeridos, verificar que el usuario tenga al menos uno
    if (item.roles) {
      const hasRequiredRole = item.roles.some((role) => userRoles.includes(role));
      if (!hasRequiredRole) return false;
    }

    // Si tiene función personalizada, ejecutarla
    if (item.showOnlyWhen) {
      return item.showOnlyWhen(user);
    }

    return true;
  });
};
