import { httpClient } from '../../../lib/api/http-client';
import type {
  ClienteProfile,
  ControladorProfile,
  DuenioProfile,
  PersonaProfile,
  UserProfileData,
  UsuarioProfile,
} from '../types';

const toPersona = (value: any): PersonaProfile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const fechaNacimientoRaw =
    value?.fechaNacimiento ?? value?.fecha_nacimiento ?? value?.fechaNac ?? null;
  const telefonoVerificadoRaw =
    typeof value?.telefonoVerificado === 'boolean'
      ? value.telefonoVerificado
      : typeof value?.telefono_verificado === 'boolean'
      ? value.telefono_verificado
      : null;
  const creadoRaw = value?.creadoEn ?? value?.creado_en ?? null;
  const actualizadoRaw = value?.actualizadoEn ?? value?.actualizado_en ?? null;
  const urlFoto =
    typeof value.url_foto === 'string'
      ? value.url_foto
      : typeof value.urlFoto === 'string'
      ? value.urlFoto
      : typeof value.url === 'string'
      ? value.url
      : null;
  return {
    paterno: typeof value.paterno === 'string' ? value.paterno : null,
    materno: typeof value.materno === 'string' ? value.materno : null,
    nombres: typeof value.nombres === 'string' ? value.nombres : null,
    // aceptar snake_case y camelCase del backend
    documentoTipo:
      typeof value.documentoTipo === 'string'
        ? value.documentoTipo
        : typeof value.documento_tipo === 'string'
        ? value.documento_tipo
        : null,
    documentoNumero:
      typeof value.documentoNumero === 'string'
        ? value.documentoNumero
        : typeof value.documento_numero === 'string'
        ? value.documento_numero
        : null,
    telefono: typeof value.telefono === 'string' ? value.telefono : null,
    telefonoVerificado:
      typeof telefonoVerificadoRaw === 'boolean' ? telefonoVerificadoRaw : null,
    fechaNacimiento: fechaNacimientoRaw ?? null,
    genero: typeof value.genero === 'string' ? value.genero : null,
    url_foto: urlFoto,
    creadoEn: creadoRaw ?? null,
    actualizadoEn: actualizadoRaw ?? null,
  };
};

// Eliminado: se construye usuario a partir de storage/token y datos minimos del backend

const toCliente = (value: any): ClienteProfile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const nivelValue = Number(value.nivel);
  return {
    apodo: typeof value.apodo === 'string' ? value.apodo : null,
    nivel: Number.isFinite(nivelValue) ? nivelValue : null,
    observaciones: typeof value.observaciones === 'string' ? value.observaciones : null,
  };
};

const toDuenio = (value: any): DuenioProfile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return {
    verificado: Boolean(value.verificado),
    verificado_en: value?.verificado_en ?? null,
  };
};

const toControlador = (value: any): ControladorProfile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return {
    codigoEmpleado: typeof value.codigoEmpleado === 'string' ? value.codigoEmpleado : null,
    activo:
      typeof value.activo === 'boolean'
        ? value.activo
        : typeof value.activo === 'number'
        ? Boolean(value.activo)
        : null,
    turno: typeof value.turno === 'string' ? value.turno : null,
  };
};

// Construye el perfil sin depender de /auth/profile
const fetchProfile = async (): Promise<UserProfileData> => {
  // Recuperar usuario basico desde localStorage o token
  let storedUser: any = null;
  try {
    const raw = localStorage.getItem('user');
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const idPersona = Number(storedUser?.id_persona);
  const idUsuario = Number(storedUser?.id_usuario);
  const roles: string[] = Array.isArray(storedUser?.roles) ? storedUser.roles : [];
  const hasRole = (role: string): boolean => roles.includes(role);

  const fetchWithFallback = <T>(request: () => Promise<T>): Promise<T | null> =>
    request()
      .then((response) => response)
      .catch(() => null);

  // Peticiones paralelas solo para los segmentos necesarios segun roles
  const personaReq = fetchWithFallback(() =>
    httpClient.get<any>('/personas/self').then((r) => r.data),
  );
  const usuarioReq = fetchWithFallback(() =>
    httpClient.get<any>('/usuarios/self').then((r) => r.data),
  );
  const clienteReq = hasRole('CLIENTE')
    ? fetchWithFallback(() => httpClient.get<any>('/clientes/self').then((r) => r.data))
    : Promise.resolve(null);
  const duenioReq = hasRole('DUENIO')
    ? fetchWithFallback(() => httpClient.get<any>('/duenio/self').then((r) => r.data))
    : Promise.resolve(null);
  const controladorReq = hasRole('CONTROLADOR')
    ? fetchWithFallback(() => httpClient.get<any>('/controlador/self').then((r) => r.data))
    : Promise.resolve(null);

  const [personaRaw, usuarioRaw, clienteRaw, duenioRaw, controladorRaw] = await Promise.all([
    personaReq,
    usuarioReq,
    clienteReq,
    duenioReq,
    controladorReq,
  ]);

  // Armar respuesta normalizada
  const usuario: UsuarioProfile = {
    correo: storedUser?.correo ?? usuarioRaw?.correo ?? '',
    usuario: storedUser?.usuario ?? usuarioRaw?.usuario ?? '',
    id_persona: idPersona || Number(usuarioRaw?.id_persona) || 0,
    id_usuario: idUsuario || Number(usuarioRaw?.id_usuario) || 0,
    correoVerificado: Boolean(usuarioRaw?.correo_verificado ?? storedUser?.correoVerificado),
    roles,
    hashContrasena: null,
    avatar: storedUser?.avatar ?? null,
  };

  const persona: PersonaProfile | null = toPersona(personaRaw);
  const cliente: ClienteProfile | null = clienteRaw
    ? toCliente({
        apodo: clienteRaw?.apodo,
        nivel: clienteRaw?.nivel,
        observaciones: clienteRaw?.observaciones,
      })
    : null;
  const duenio: DuenioProfile | null = duenioRaw ? toDuenio(duenioRaw) : null;
  const controlador: ControladorProfile | null = controladorRaw ? toControlador(controladorRaw) : null;

  return { persona, usuario, cliente, duenio, controlador };
};

const profileService = {
  fetchProfile,
  updateUserBasic: async (payload: { id_usuario: number; usuario?: string; correo?: string }) => {
    const { id_usuario, ...rest } = payload;
    const res = await httpClient.patch<any>(`/usuarios/${id_usuario}`, rest);
    return res.data;
  },
  changePassword: async (payload: { id_usuario: number; nuevaContrasena: string }) => {
    const { id_usuario, nuevaContrasena } = payload;
    const res = await httpClient.patch<any>(`/usuarios/${id_usuario}`, { nuevaContrasena });
    return res.data;
  },
};

export default profileService;
