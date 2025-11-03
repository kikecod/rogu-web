// User profile types
export type AppRole = 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN';

export interface PersonaProfile {
  idPersona: number;
  nombres: string;
  paterno: string | null;
  materno: string | null;
  telefono: string | null;
  telefonoVerificado: boolean;
  fechaNacimiento: string | Date | null;
  genero: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  urlFoto: string | null;
  bio?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  ocupacion?: string | null;
  deportesFavoritos?: string[] | null;
  creadoEn: string | Date | null;
  actualizadoEn: string | Date | null;
  eliminadoEn?: string | Date | null;
}

export interface UsuarioProfile {
  idUsuario: number;
  correo: string;
  usuario: string;
  idPersona: number;
  correoVerificado: boolean;
  roles: AppRole[];
  estado?: string;
  avatar?: string | null;
  avatarPath?: string | null;
}

export interface ClienteProfile {
  idCliente: number;
  apodo: string | null;
  nivel: number | null;
  observaciones: string | null;
  persona?: PersonaProfile;
}

export interface DuenioProfile {
  idDuenio: number;
  verificado: boolean;
  verificadoEn?: string | Date | null;
}

export interface ControladorProfile {
  idControlador: number;
  codigoEmpleado: string | null;
  turno: string | null;
  activo: boolean;
}

export interface UsuarioPreferencias {
  idPreferencias: number;
  mostrarEmail: boolean;
  mostrarTelefono: boolean;
  perfilPublico: boolean;
  notificarReservas: boolean;
  notificarPromociones: boolean;
  notificarRecordatorios: boolean;
  idioma: string;
  zonaHoraria: string;
  modoOscuro: boolean;
  firmaReserva?: string | null;
  creadoEn?: string | Date | null;
  actualizadoEn?: string | Date | null;
}

export interface UserProfileData {
  persona: PersonaProfile | null;
  usuario: UsuarioProfile;
  cliente: ClienteProfile | null;
  duenio: DuenioProfile | null;
  controlador: ControladorProfile | null;
  preferencias: UsuarioPreferencias | null;
}
