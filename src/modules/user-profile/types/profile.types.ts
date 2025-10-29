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

export interface UserProfileData {
  persona: PersonaProfile | null;
  usuario: UsuarioProfile;
  cliente: ClienteProfile | null;
  duenio: DuenioProfile | null;
  controlador: ControladorProfile | null;
}
