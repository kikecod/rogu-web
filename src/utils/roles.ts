import type { AppRole } from '../types';

/**
 * Variantes de roles para determinar qué componente de perfil mostrar
 */
export type RoleVariant =
  | 'ADMIN'
  | 'CLIENTE'
  | 'CLIENTE_DUENIO'
  | 'CLIENTE_CONTROLADOR'
  | 'CLIENTE_DUENIO_CONTROLADOR'
  | 'ANON';

/**
 * Determina la variante de perfil basándose en los roles del usuario
 * @param roles - Array de roles del usuario
 * @returns La variante de perfil correspondiente
 */
export function resolveRoleVariant(roles: AppRole[]): RoleVariant {
  // Si tiene rol ADMIN, siempre mostrar vista de admin
  if (roles.includes('ADMIN')) {
    return 'ADMIN';
  }

  const hasCliente = roles.includes('CLIENTE');
  const hasDuenio = roles.includes('DUENIO');
  const hasControlador = roles.includes('CONTROLADOR');

  // Combinaciones de roles
  if (hasCliente && hasDuenio && hasControlador) {
    return 'CLIENTE_DUENIO_CONTROLADOR';
  }

  if (hasCliente && hasDuenio) {
    return 'CLIENTE_DUENIO';
  }

  if (hasCliente && hasControlador) {
    return 'CLIENTE_CONTROLADOR';
  }

  if (hasCliente) {
    return 'CLIENTE';
  }

  // Si no tiene ningún rol reconocido, mostrar vista genérica
  return 'ANON';
}
