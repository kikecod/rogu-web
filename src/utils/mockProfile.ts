import type { UserProfileData } from '../types';

/**
 * Datos mock del perfil para desarrollo
 * Este archivo se puede eliminar cuando el backend esté listo
 */
export const getMockProfileData = (userId: number, userEmail: string, userName: string, roles: string[]): UserProfileData => {
  return {
    persona: {
      idPersona: userId,
      nombres: 'Juan Carlos',
      paterno: 'García',
      materno: 'López',
      telefono: '+591 70123456',
      telefonoVerificado: true,
      fechaNacimiento: '1990-05-15',
      genero: 'MASCULINO',
      documentoTipo: 'CI',
      documentoNumero: '12345678',
      url_foto: null,
      creadoEn: '2024-01-15T10:00:00.000Z',
      actualizadoEn: '2024-10-28T08:30:00.000Z',
    },
    usuario: {
      idUsuario: userId,
      id_usuario: userId,
      correo: userEmail,
      usuario: userName,
      id_persona: userId,
      correoVerificado: true,
      roles: roles as any[],
      avatar: null,
    },
    cliente: roles.includes('CLIENTE') ? {
      idCliente: userId,
      apodo: 'El Tigre',
      nivel: 8,
      observaciones: 'Jugador regular, buen comportamiento',
    } : null,
    duenio: roles.includes('DUENIO') ? {
      idDuenio: userId,
      verificado: true,
      verificado_en: '2024-08-10T15:20:00.000Z',
    } : null,
    controlador: roles.includes('CONTROLADOR') ? {
      idControlador: userId,
      codigoEmpleado: 'CTRL-001',
      turno: 'Mañana (08:00 - 16:00)',
      activo: true,
    } : null,
  };
};
