export const APP_NAME = 'ROGU';
export const APP_DESCRIPTION = 'Reserva canchas deportivas de forma facil y rapida';

export const USER_ROLES = {
  USER: 'CLIENTE',
  OWNER: 'DUENIO',
  ADMIN: 'ADMIN',
  CONTROLLER: 'CONTROLADOR',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
