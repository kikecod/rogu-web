import type { AppRole } from '../../constants';

export type RoleVariant =
  | 'ANON'
  | 'ADMIN'
  | 'CLIENTE'
  | 'CLIENTE_DUENIO'
  | 'CLIENTE_CONTROLADOR'
  | 'CLIENTE_DUENIO_CONTROLADOR';

const toList = (roles: readonly AppRole[] | undefined | null): readonly AppRole[] =>
  Array.isArray(roles) ? roles : [];

const hasRole = (roles: readonly AppRole[], role: AppRole) => roles.includes(role);

const hasAllRoles = (roles: readonly AppRole[], required: readonly AppRole[]) =>
  required.every((role) => hasRole(roles, role));

export const resolveRoleVariant = (roles: readonly AppRole[] | undefined | null): RoleVariant => {
  const list = toList(roles);
  if (hasRole(list, 'ADMIN')) return 'ADMIN';
  if (hasAllRoles(list, ['CLIENTE', 'DUENIO', 'CONTROLADOR'])) return 'CLIENTE_DUENIO_CONTROLADOR';
  if (hasAllRoles(list, ['DUENIO', 'CONTROLADOR'])) return 'CLIENTE_DUENIO_CONTROLADOR';
  if (hasAllRoles(list, ['CLIENTE', 'DUENIO'])) return 'CLIENTE_DUENIO';
  if (hasAllRoles(list, ['CLIENTE', 'CONTROLADOR'])) return 'CLIENTE_CONTROLADOR';
  if (hasRole(list, 'DUENIO')) return 'CLIENTE_DUENIO';
  if (hasRole(list, 'CONTROLADOR')) return 'CLIENTE_CONTROLADOR';
  if (hasRole(list, 'CLIENTE')) return 'CLIENTE';
  return 'ANON';
};

export const roleHelpers = {
  hasRole,
  hasAllRoles,
};

