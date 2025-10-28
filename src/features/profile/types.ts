export interface PersonaProfile {
  paterno: string | null;
  materno: string | null;
  nombres: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  telefono: string | null;
  fechaNacimiento: string | Date | null;
  genero: string | null;
  url_foto: string | null;
}

export interface UsuarioProfile {
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  correoVerificado: boolean;
  roles: string[];
  hashContrasena?: string | null;
  avatar?: string | null;
}

export interface ClienteProfile {
  apodo: string | null;
  nivel: number | null;
  observaciones: string | null;
}

export interface DuenioProfile {
  verificado: boolean;
  verificado_en?: string | Date | null;
}

export interface ControladorProfile {
  codigoEmpleado: string | null;
  activo: boolean | null;
  turno: string | null;
}

export interface UserProfileData {
  persona: PersonaProfile | null;
  usuario: UsuarioProfile;
  cliente?: ClienteProfile | null;
  duenio?: DuenioProfile | null;
  controlador?: ControladorProfile | null;
}

