import { getApiUrl } from '@/core/config/api';
import type {
  UserProfileData,
  UsuarioPreferencias,
  PersonaProfile,
  ClienteProfile,
  ControladorProfile,
  AppRole,
} from '../types/profile.types';
import { getMockProfileData } from '../lib/mockProfile';

type UpdatePersonaPayload = Partial<Pick<
  PersonaProfile,
  | 'nombres'
  | 'paterno'
  | 'materno'
  | 'documentoTipo'
  | 'documentoNumero'
  | 'telefono'
  | 'direccion'
  | 'ciudad'
  | 'pais'
  | 'ocupacion'
  | 'bio'
  | 'deportesFavoritos'
>>;

type UpdateClientePayload = Partial<Pick<ClienteProfile, 'apodo' | 'nivel' | 'observaciones'>>;

type UpdateControladorPayload = Partial<Pick<ControladorProfile, 'codigoEmpleado' | 'turno' | 'activo'>>;

type UpdatePreferencesPayload = Partial<
  Pick<
    UsuarioPreferencias,
    | 'mostrarEmail'
    | 'mostrarTelefono'
    | 'perfilPublico'
    | 'notificarReservas'
    | 'notificarPromociones'
    | 'notificarRecordatorios'
    | 'idioma'
    | 'zonaHoraria'
    | 'modoOscuro'
    | 'firmaReserva'
  >
>;

type ChangePasswordPayload = {
  contrasenaActual: string;
  nuevaContrasena: string;
};

type RequestEmailChangePayload = {
  nuevoCorreo: string;
  contrasenaActual: string;
};

type DeleteAccountPayload = {
  contrasenaActual: string;
  confirmacion: string;
};

type DeactivateAccountPayload = {
  motivo?: string;
};

type UpdateUsernamePayload = {
  idUsuario: number;
  usuario: string;
};

// Nuevos payloads alineados al controlador de Usuarios del backend
type UpdateUserBasicPayload = {
  idUsuario: number;
  correo?: string;
  usuario?: string;
};

type ChangePasswordSimplePayload = {
  idUsuario: number;
  nuevaContrasena: string;
};

const USE_MOCK_DATA = false;
const DEBUG_PROFILE = (import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true';

const DEFAULT_PREFERENCIAS: UsuarioPreferencias = {
  idPreferencias: 0,
  mostrarEmail: true,
  mostrarTelefono: false,
  perfilPublico: true,
  notificarReservas: true,
  notificarPromociones: true,
  notificarRecordatorios: true,
  idioma: 'es',
  zonaHoraria: 'America/La_Paz',
  modoOscuro: false,
  firmaReserva: null,
};

// Canonicaliza nombres de rol provenientes del backend con variaciones
// Acepta: "DUEÑO"/"DUENO"/"OWNER" -> "DUENIO"; normaliza mayúsculas y elimina acentos
const canonicalizeRole = (role: string): AppRole | null => {
  if (!role) return null;
  const upper = role.toString().trim().toUpperCase();
  // Eliminar diacríticos para que DUEÑO -> DUENO
  const normalized = upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  switch (normalized) {
    case 'CLIENTE':
      return 'CLIENTE';
    case 'DUENIO':
    case 'DUENO':
    case 'OWNER':
      return 'DUENIO';
    case 'CONTROLADOR':
    case 'CONTROL':
      return 'CONTROLADOR';
    case 'ADMIN':
    case 'ADMINISTRADOR':
      return 'ADMIN';
    default:
      return null;
  }
};

const coalesce = <T = unknown>(
  source: Record<string, any> | null | undefined,
  keys: Array<string>,
  fallback?: T,
): T | undefined => {
  if (!source) return fallback;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return fallback;
};

const toNullableString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const str = String(value);
  return str.trim().length > 0 ? str : null;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;
    if (['true', '1', 'yes', 'si'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  return fallback;
};

const normalizeDateValue = (value: unknown): string | Date | null => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return value;
  const strValue = toNullableString(value);
  if (!strValue) return null;
  const date = new Date(strValue);
  return Number.isNaN(date.getTime()) ? strValue : date.toISOString();
};

const normalizeDeportesFavoritos = (value: unknown): string[] | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const items = value
      .map((item) => toNullableString(item))
      .filter((item): item is string => Boolean(item));
    return items.length > 0 ? items : [];
  }
  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : [];
  }
  return null;
};

class ProfileService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private ensureToken(): string {
    const token = this.getToken();
    if (!token) {
      const err: any = new Error('No hay token de autenticación');
      err.status = 401;
      err.code = 'NO_TOKEN';
      throw err;
    }
    return token;
  }

  private jsonHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    };
  }

  private normalizeProfileResponse(payload: any): UserProfileData {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Respuesta de perfil no v\u00e1lida');
    }

    const rawUsuario = payload.usuario ?? payload;
    const persona =
      this.normalizePersona(
        payload.persona ?? rawUsuario?.persona ?? payload.cliente?.persona ?? null,
        toNumber(coalesce(rawUsuario, ['idPersona', 'id_persona']), 0),
      );

    const usuario = this.normalizeUsuario(rawUsuario, persona);
  const clienteRaw = coalesce(payload, ['cliente']);
  const duenioRaw = coalesce(payload, ['duenio', 'dueno', 'owner', 'propietario']);
  const controladorRaw = coalesce(payload, ['controlador', 'controller']);

  const cliente = clienteRaw ? this.normalizeCliente(clienteRaw) : null;
  const duenio = duenioRaw ? this.normalizeDuenio(duenioRaw) : null;
  const controlador = controladorRaw ? this.normalizeControlador(controladorRaw) : null;

    const preferencias = payload.preferencias
      ? this.normalizePreferencias(payload.preferencias)
      : null;

    return {
      persona,
      usuario,
      cliente,
      duenio,
      controlador,
      preferencias,
    };
  }

  private normalizePersona(raw: any, fallbackId?: number): PersonaProfile | null {
    if (!raw || typeof raw !== 'object') return null;

    const deportesFavoritos = normalizeDeportesFavoritos(
      coalesce(raw, ['deportesFavoritos', 'deportes_favoritos']),
    );

    const persona: PersonaProfile = {
      idPersona: toNumber(
        coalesce(raw, ['idPersona', 'id_persona', 'id']),
        fallbackId ?? 0,
      ),
      nombres: toNullableString(coalesce(raw, ['nombres', 'nombre'])) ?? '',
      paterno: toNullableString(coalesce(raw, ['paterno', 'apellidoPaterno', 'apellido_paterno'])),
      materno: toNullableString(coalesce(raw, ['materno', 'apellidoMaterno', 'apellido_materno'])),
      telefono: toNullableString(coalesce(raw, ['telefono', 'telefonoPrincipal', 'telefono_principal'])),
      telefonoVerificado: toBoolean(
        coalesce(raw, ['telefonoVerificado', 'telefono_verificado']),
        false,
      ),
      fechaNacimiento: normalizeDateValue(coalesce(raw, ['fechaNacimiento', 'fecha_nacimiento'])),
      genero: toNullableString(coalesce(raw, ['genero', 'sexo'])),
      documentoTipo: toNullableString(coalesce(raw, ['documentoTipo', 'documento_tipo', 'tipoDocumento'])),
      documentoNumero: toNullableString(
        coalesce(raw, ['documentoNumero', 'documento_numero', 'numeroDocumento']),
      ),
      urlFoto: toNullableString(coalesce(raw, ['urlFoto', 'url_foto', 'foto', 'fotoUrl'])),
      bio: toNullableString(coalesce(raw, ['bio', 'biografia'])),
      direccion: toNullableString(coalesce(raw, ['direccion', 'direccionPrincipal', 'direccion_principal'])),
      ciudad: toNullableString(coalesce(raw, ['ciudad', 'municipio'])),
      pais: toNullableString(coalesce(raw, ['pais', 'paisResidencia', 'pais_residencia'])),
      ocupacion: toNullableString(coalesce(raw, ['ocupacion', 'profesion'])),
      deportesFavoritos,
      creadoEn: normalizeDateValue(coalesce(raw, ['creadoEn', 'creado_en', 'createdAt'])),
      actualizadoEn: normalizeDateValue(coalesce(raw, ['actualizadoEn', 'actualizado_en', 'updatedAt'])),
      eliminadoEn: normalizeDateValue(coalesce(raw, ['eliminadoEn', 'eliminado_en', 'deletedAt'])),
    };

    return persona;
  }

  private normalizeUsuario(raw: any, persona: PersonaProfile | null): UserProfileData['usuario'] {
    const rawRoles = raw?.roles ?? raw?.Roles ?? [];
    const roleStrings = Array.isArray(rawRoles)
      ? rawRoles
          .map((role) => {
            if (typeof role === 'string') return role;
            if (role && typeof role === 'object') {
              return toNullableString(coalesce(role, ['rol', 'nombre', 'name', 'role'])) ?? '';
            }
            return '';
          })
          .filter((role): role is string => Boolean(role))
      : [];

    const roles = Array.from(
      new Set(
        roleStrings
          .map((r) => canonicalizeRole(r))
          .filter((r): r is AppRole => Boolean(r)),
      ),
    );

    const avatarPath = toNullableString(coalesce(raw, ['avatarPath', 'avatar_path']));
    const avatarCandidate =
      toNullableString(coalesce(raw, ['avatar'])) ?? avatarPath ?? persona?.urlFoto ?? null;

    return {
      idUsuario: toNumber(coalesce(raw, ['idUsuario', 'id_usuario', 'id']), 0),
      correo: toNullableString(coalesce(raw, ['correo', 'email'])) ?? '',
      usuario: toNullableString(
        coalesce(raw, ['usuario', 'username', 'nombreUsuario', 'nombre_usuario']),
      ) ?? '',
      idPersona: toNumber(coalesce(raw, ['idPersona', 'id_persona']), persona?.idPersona ?? 0),
      correoVerificado: toBoolean(
        coalesce(raw, ['correoVerificado', 'correo_verificado', 'verificado']),
        false,
      ),
      roles,
      estado: toNullableString(coalesce(raw, ['estado', 'status'])) ?? undefined,
      avatar: avatarCandidate,
      avatarPath,
    };
  }

  private normalizeCliente(raw: any): ClienteProfile {
    const persona = this.normalizePersona(
      raw?.persona ?? null,
      toNumber(coalesce(raw, ['idCliente', 'id_cliente', 'id']), 0),
    );

    const nivelValue = coalesce(raw, ['nivel']);
    let nivel: number | null = null;
    if (nivelValue !== undefined && nivelValue !== null) {
      const parsedNivel = Number(nivelValue);
      nivel = Number.isNaN(parsedNivel) ? null : parsedNivel;
    }

    return {
      idCliente: toNumber(coalesce(raw, ['idCliente', 'id_cliente', 'id']), 0),
      apodo: toNullableString(coalesce(raw, ['apodo', 'nickname'])),
      nivel,
      observaciones: toNullableString(coalesce(raw, ['observaciones', 'notas', 'observacion'])),
      persona: persona ?? undefined,
    };
  }

  private normalizeDuenio(raw: any): UserProfileData['duenio'] {
    return {
      idDuenio: toNumber(coalesce(raw, ['idDuenio', 'id_duenio', 'id_dueno', 'id']), 0),
      verificado: toBoolean(coalesce(raw, ['verificado', 'esVerificado', 'es_verificado']), false),
      verificadoEn: normalizeDateValue(
        coalesce(raw, ['verificadoEn', 'verificado_en', 'fechaVerificacion', 'fecha_verificacion']),
      ),
    };
  }

  private normalizeControlador(raw: any): ControladorProfile {
    return {
      idControlador: toNumber(coalesce(raw, ['idControlador', 'id_controlador', 'id']), 0),
      codigoEmpleado: toNullableString(coalesce(raw, ['codigoEmpleado', 'codigo_empleado', 'codigo'])),
      turno: toNullableString(coalesce(raw, ['turno', 'horario'])),
      activo: toBoolean(coalesce(raw, ['activo', 'estaActivo', 'esta_activo']), true),
    };
  }

  private normalizePreferencias(raw: any): UsuarioPreferencias {
    const base = { ...DEFAULT_PREFERENCIAS };

    return {
      idPreferencias: toNumber(coalesce(raw, ['idPreferencias', 'id_preferencias', 'id']), base.idPreferencias),
      mostrarEmail: toBoolean(
        coalesce(raw, ['mostrarEmail', 'mostrar_email']),
        base.mostrarEmail,
      ),
      mostrarTelefono: toBoolean(
        coalesce(raw, ['mostrarTelefono', 'mostrar_telefono']),
        base.mostrarTelefono,
      ),
      perfilPublico: toBoolean(
        coalesce(raw, ['perfilPublico', 'perfil_publico']),
        base.perfilPublico,
      ),
      notificarReservas: toBoolean(
        coalesce(raw, ['notificarReservas', 'notificar_reservas']),
        base.notificarReservas,
      ),
      notificarPromociones: toBoolean(
        coalesce(raw, ['notificarPromociones', 'notificar_promociones']),
        base.notificarPromociones,
      ),
      notificarRecordatorios: toBoolean(
        coalesce(raw, ['notificarRecordatorios', 'notificar_recordatorios']),
        base.notificarRecordatorios,
      ),
      idioma: toNullableString(coalesce(raw, ['idioma', 'language'])) ?? base.idioma,
      zonaHoraria: toNullableString(coalesce(raw, ['zonaHoraria', 'zona_horaria', 'timezone'])) ?? base.zonaHoraria,
      modoOscuro: toBoolean(coalesce(raw, ['modoOscuro', 'modo_oscuro', 'darkMode']), base.modoOscuro),
      firmaReserva: toNullableString(coalesce(raw, ['firmaReserva', 'firma_reserva'])) ?? base.firmaReserva,
      creadoEn: normalizeDateValue(coalesce(raw, ['creadoEn', 'creado_en', 'createdAt'])),
      actualizadoEn: normalizeDateValue(coalesce(raw, ['actualizadoEn', 'actualizado_en', 'updatedAt'])),
    };
  }

  private async requestProfileWithFallback(token: string): Promise<{
    endpoint: string;
    payload: any;
    attempts: Array<{
      endpoint: string;
      status?: number;
      message?: string;
      error?: string;
    }>;
  }> {
    const candidateEndpoints = ['/profile', '/auth/profile', '/perfil', '/auth/perfil'];
    const attempts: Array<{ endpoint: string; status?: number; message?: string; error?: string }> = [];

    for (const endpoint of candidateEndpoints) {
      const timestamp = Date.now();
      const cacheBustingEndpoint = endpoint.includes('?')
        ? `${endpoint}&_=${timestamp}`
        : `${endpoint}?_=${timestamp}`;
      const url = getApiUrl(cacheBustingEndpoint);
      try {
        let response = await fetch(url, {
          method: 'GET',
          headers: this.jsonHeaders(token),
          cache: 'no-store',
        });

        if (response.status === 304) {
          try {
            response = await fetch(url, {
              method: 'GET',
              headers: this.jsonHeaders(token),
              cache: 'reload',
            });
          } catch (reloadErr) {
            attempts.push({
              endpoint: cacheBustingEndpoint,
              status: 304,
              error: reloadErr instanceof Error ? reloadErr.message : String(reloadErr),
            });
            continue;
          }
        }

        if (response.ok) {
          const rawText = await response.text();
          console.log('[profile] raw text from', cacheBustingEndpoint, rawText);
          let payload: any;
          try {
            payload = rawText ? JSON.parse(rawText) : null;
          } catch (parseError) {
            console.error('[profile] JSON parse error', parseError, rawText);
            attempts.push({
              endpoint: cacheBustingEndpoint,
              status: response.status,
              message: `JSON inválido: ${(parseError as Error).message}`,
            });
            continue;
          }
          console.log('[profile] raw payload parsed', payload);
          return { endpoint: cacheBustingEndpoint, payload, attempts };
        }

        let bodyText: string | null = null;
        try {
          bodyText = await response.text();
        } catch {
          bodyText = null;
        }

        let message: string | undefined;
        if (bodyText) {
          try {
            const parsed = JSON.parse(bodyText);
            message = parsed?.message ?? JSON.stringify(parsed);
          } catch {
            message = bodyText;
          }
        } else {
          message = response.statusText || undefined;
        }

        attempts.push({
          endpoint: cacheBustingEndpoint,
          status: response.status,
          message,
        });
        // En caso de 404 probamos el siguiente endpoint para mantener compatibilidad con APIs antiguas.
        // Para otros códigos seguimos probando igualmente para ser tolerantes a cambios en rutas.
      } catch (err) {
        attempts.push({
          endpoint: cacheBustingEndpoint,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const aggregatedError: any = new Error('No se pudo cargar el perfil');
    aggregatedError.attempts = attempts;

    const statusFromAttempts = attempts
      .map((attempt) => attempt.status)
      .find((status): status is number => typeof status === 'number');
    if (statusFromAttempts !== undefined) {
      aggregatedError.status = statusFromAttempts;
    }

    throw aggregatedError;
  }

  async fetchProfile(): Promise<UserProfileData> {
    const token = this.ensureToken();

    if (USE_MOCK_DATA) {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No hay datos de usuario');
      }
      const user = JSON.parse(userStr);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockData = getMockProfileData(
        user.idUsuario || user.id_usuario || 1,
        user.correo || 'usuario@example.com',
        user.usuario || 'usuario',
        user.roles || ['CLIENTE'],
      );
      return {
        ...mockData,
        preferencias: DEFAULT_PREFERENCIAS,
      };
    }

    const { endpoint, payload, attempts } = await this.requestProfileWithFallback(token);

    if (DEBUG_PROFILE) {
      // eslint-disable-next-line no-console
      console.debug('[profile] GET', getApiUrl(endpoint), '->', payload, { attempts });
    }

    const normalized = this.normalizeProfileResponse(payload);
    console.log('[profile] normalized payload', normalized);
    return normalized;
  }

  async updateProfileSections(sections: {
    persona?: UpdatePersonaPayload;
    cliente?: UpdateClientePayload;
    controlador?: UpdateControladorPayload;
  }): Promise<UserProfileData> {
    const token = this.ensureToken();

    if (!sections.persona && !sections.cliente && !sections.controlador) {
      throw new Error('No hay datos para actualizar');
    }

    const response = await fetch(getApiUrl('/profile/personal'), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(sections),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar la informacion personal');
    }

    const responseData = await response.json();
    return this.normalizeProfileResponse(responseData);
  }

  async updatePreferences(preferences: UpdatePreferencesPayload): Promise<UsuarioPreferencias> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/preferences'), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudieron actualizar las preferencias');
    }
    const responseData = await response.json();
    return this.normalizePreferencias(responseData);
  }

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const token = this.ensureToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(getApiUrl('/profile/avatar'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar el avatar');
    }

    return await response.json();
  }

  async removeAvatar(): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/avatar'), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo eliminar el avatar');
    }
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/password'), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar la contraseña');
    }
  }

  async updateUsername(payload: UpdateUsernamePayload): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl(`/usuarios/${payload.idUsuario}`), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify({ usuario: payload.usuario }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar el nombre de usuario');
    }
  }

  async requestEmailChange(payload: RequestEmailChangePayload): Promise<{ message: string; token?: string }> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/email/request'), {
      method: 'POST',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo solicitar el cambio de correo');
    }

    return await response.json();
  }

  async verifyEmailChange(tokenValue: string): Promise<void> {
    const response = await fetch(getApiUrl('/profile/email/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenValue }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'El token de verificación no es válido');
    }
  }

  async exportData(): Promise<{ fileName: string; mimeType: string; base64: string }> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/export'), {
      method: 'POST',
      headers: this.jsonHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo exportar la información');
    }

    return await response.json();
  }

  async deactivateAccount(payload: DeactivateAccountPayload): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/deactivate'), {
      method: 'POST',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo desactivar la cuenta');
    }
  }

  async deleteAccount(payload: DeleteAccountPayload): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl('/profile/delete'), {
      method: 'POST',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo eliminar la cuenta');
    }
  }

  // --------------------
  // Integraciones directas con UsuariosController
  // --------------------

  /**
   * Actualiza correo y/o nombre de usuario con PUT /usuarios/:id
   */
  async updateUserBasic(payload: UpdateUserBasicPayload): Promise<void> {
    const token = this.ensureToken();

    const { idUsuario, ...body } = payload;
    const response = await fetch(getApiUrl(`/usuarios/${idUsuario}`), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar los datos de cuenta');
    }
  }

  /**
   * Cambia contraseña con PUT /usuarios/:id/cambiar-contrasena
   */
  async changePasswordSimple(payload: ChangePasswordSimplePayload): Promise<void> {
    const token = this.ensureToken();

    const response = await fetch(getApiUrl(`/usuarios/${payload.idUsuario}/cambiar-contrasena`), {
      method: 'PUT',
      headers: this.jsonHeaders(token),
      body: JSON.stringify({ nuevaContrasena: payload.nuevaContrasena }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo cambiar la contraseña');
    }
  }
}

const profileService = new ProfileService();
export default profileService;










