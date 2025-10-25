/**
 * Backend data contracts derived from `estructura del backend.json`.
 * Dates are represented as ISO strings (YYYY-MM-DD or full ISO date-time).
 * Decimal values may arrive as string depending on the backend driver.
 */

export type ISODate = string;
export type ISODateTime = string;
export type Decimal = number | string;

// Shared enums and literal unions
export type documento_tipo = 'CC' | 'CE' | 'TI' | 'PP';
export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';
export type TipoRol = 'ADMIN' | 'DUENIO' | 'CONTROLADOR' | 'CLIENTE';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'PENDIENTE';
export type EstadoDenuncia = 'pendiente' | 'en_proceso' | 'resuelto';
export type EstadoReserva = 'Confirmada' | 'Pendiente' | 'Cancelada';

/**
 * Personas base (usuarios, clientes, duenos, controladores).
 * PK: id_persona
 */
export interface Persona {
  id_persona: number;
  nombres: string;
  paterno: string;
  materno: string;
  documento_tipo: documento_tipo | null;
  documento_numero: string | null;
  telefono: string;
  telefono_verificado: boolean;
  fecha_nacimiento: ISODate;
  genero: Genero;
  url_foto: string | null;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/** Roles del sistema. PK: id_rol */
export interface Rol {
  id_rol: number;
  rol: TipoRol;
}

/**
 * Credenciales y configuracion de acceso.
 * PK: id_usuario, FK: id_persona -> personas.id_persona
 */
export interface Usuario {
  id_usuario: number;
  id_persona: number;
  usuario: string;
  correo: string;
  correo_verificado: boolean;
  hash_contrasena: string;
  hash_refresh_token: string | null;
  estado: EstadoUsuario;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  ultimo_acceso_en: ISODateTime | null;
}

/** Perfil de cliente (1:1 con persona). PK y FK: id_cliente */
export interface Cliente {
  id_cliente: number;
  apodo: string | null;
  nivel: number;
  observaciones: string | null;
}

/** Propietarios de sedes y canchas. PK y FK: id_persona_d */
export interface Duenio {
  id_persona_d: number;
  verificado: boolean;
  verificado_en: ISODateTime | null;
  imagen_ci: string | null;
  imagen_facial: string | null;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/** Operadores que controlan accesos. PK y FK: id_persona_ope */
export interface Controlador {
  id_persona_ope: number;
  codigo_empleado: string;
  activo: boolean;
  turno: string;
}

/**
 * Sedes o complejos administrados por duenos.
 * PK: id_sede, FK: id_persona_d -> duenio.id_persona_d
 */
export interface Sede {
  id_sede: number;
  id_persona_d: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: string;
  longitud: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  licencia_funcionamiento: string;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/**
 * Canchas o espacios deportivos.
 * PK: id_cancha, FK: id_sede -> sede.id_sede
 */
export interface Cancha {
  id_cancha: number;
  id_sede: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglas_uso: string;
  iluminacion: string;
  estado: string;
  precio: Decimal;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/** Disciplinas deportivas. */
export interface Disciplina {
  id_disciplina: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/** Multimedia asociada a las canchas. */
export interface Foto {
  id_foto: number;
  id_cancha: number;
  url_foto: string;
}

/** Tabla parte: relacion cancha-disciplina. PK compuesta. */
export interface Parte {
  id_disciplina: number;
  id_cancha: number;
  eliminado_en: ISODateTime | null;
}

/**
 * Relacion usuarios-roles.
 * PK compuesta: (id_usuario, id_rol)
 */
export interface UsuariosRoles {
  id_usuario: number;
  id_rol: number;
  asignado_en: ISODateTime;
  revocado_en: ISODateTime | null;
  eliminado_en: ISODateTime | null;
}

/**
 * Reservas realizadas por clientes sobre canchas especificas.
 * PK: id_reserva, FKs: id_cliente -> cliente, id_cancha -> cancha
 */
export interface Reserva {
  id_reserva: number;
  id_cliente: number;
  id_cancha: number;
  inicia_en: ISODateTime;
  termina_en: ISODateTime;
  cantidad_personas: number;
  requiere_aprobacion: boolean;
  monto_base: Decimal;
  monto_extra: Decimal;
  monto_total: Decimal;
  estado: EstadoReserva;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime;
  eliminado_en: ISODateTime | null;
}

/** Calificaciones realizadas por clientes. PK compuesta. */
export interface Califica {
  id_cliente: number;
  id_cancha: number;
  id_sede: number;
  puntaje: number;
  dimensiones: string;
  comentario: string;
  creada_en: ISODateTime;
}

/** Denuncias o reportes sobre canchas (por sede). PK compuesta. */
export interface Denuncia {
  id_cliente: number;
  id_cancha: number;
  id_sede: number;
  categoria: string;
  gravedad: string;
  estado: EstadoDenuncia;
  titulo: string;
  descripcion: string | null;
  asignado_a: string | null;
  creado_en: ISODateTime;
  actualizado_en: ISODateTime | null;
}

/**
 * Pases o codigos QR para validar ingreso a una reserva.
 * PK: id_pase_acceso
 */
export interface PasesAcceso {
  id_pase_acceso: number;
  id_reserva: number;
  hash_code: string;
  valido_desde: ISODateTime;
  valido_hasta: ISODateTime;
  estado: string;
  creado_en: ISODateTime;
}

/**
 * Bitacora de controles realizados por operadores.
 * PK compuesta: (id_persona_ope, id_reserva, id_pase_acceso)
 */
export interface Controla {
  id_persona_ope: number;
  id_reserva: number;
  id_pase_acceso: number;
  accion: string;
  resultado: string;
  fecha: ISODateTime;
}

/**
 * Asignaciones de controladores a sedes en periodos determinados.
 * PK compuesta: (id_persona_ope, id_sede)
 */
export interface Trabaja {
  id_persona_ope: number;
  id_sede: number;
  fecha_inicio: ISODate;
  fecha_fin: ISODate | null;
  activo: boolean;
}

/**
 * Registro de cancelaciones de reservas (cliente o sistema).
 * PK: id_cancelacion
 */
export interface Cancelacion {
  id_cancelacion: number;
  id_cliente: number;
  id_reserva: number;
  cancelada_en: ISODateTime;
  motivo: string | null;
  canal: string | null;
}

/**
 * Participantes invitados o confirmados en una reserva.
 * PK compuesta: (id_reserva, id_cliente)
 */
export interface Participa {
  id_reserva: number;
  id_cliente: number;
  confirmado: boolean;
  check_in_en: ISODateTime | null;
}

/**
 * Transacciones de pago asociadas a reservas.
 * PK: id_transaccion, FK: id_reserva -> reserva.id_reserva
 */
export interface Transaccion {
  id_transaccion: number;
  id_reserva: number;
  pasarela: string;
  metodo: string;
  monto: Decimal;
  estado: string;
  id_externo: string;
  comision_pasarela: Decimal;
  comision_plataforma: Decimal;
  moneda_liquidada: string;
  codigo_autorizacion: string;
  creado_en: ISODateTime;
  capturado_en: ISODateTime;
  reembolsado_en: ISODateTime | null;
}
