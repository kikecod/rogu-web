import { apiClient } from '@/admin-panel/lib/apiClient';
import { adminApiClient } from '@/admin-panel/lib/adminApiClient';
import { getImageUrl } from '@/core/config/api';
import type {
  CanchaAdmin,
  CanchaAdminDetail,
  CanchaCreateDto,
  CanchaUpdateDto,
  CanchasDeSedeResponse,
  CanchasFilters,
  DisciplinaAdmin,
  FotoCanchaAdmin,
} from '../types';

const resolveImageUrl = (foto: any): string => {
  if (!foto) return '';
  if (typeof foto.url === 'string' && foto.url.trim()) {
    return getImageUrl(foto.url);
  }
  if (typeof foto.urlFoto === 'string' && foto.urlFoto.trim()) {
    return getImageUrl(foto.urlFoto);
  }
  if (typeof foto.imageUrl === 'string' && foto.imageUrl.trim()) {
    return getImageUrl(foto.imageUrl);
  }
  return '';
};

const mapFoto = (foto: any): FotoCanchaAdmin => ({
  idFoto: foto?.idFoto || foto?.id || 0,
  urlFoto: resolveImageUrl(foto),
  esPrincipal: foto?.esPrincipal ?? foto?.principal ?? false,
  orden: typeof foto?.orden === 'number' ? foto.orden : undefined,
  tipo: foto?.tipo,
});

const mapDisciplina = (disciplina: any): DisciplinaAdmin => ({
  idDisciplina: disciplina?.idDisciplina || disciplina?.id || 0,
  nombre: disciplina?.nombre || disciplina?.name || 'Disciplina',
  categoria: disciplina?.categoria,
  descripcion: disciplina?.descripcion,
});

const normalizeCancha = (cancha: any): CanchaAdmin => ({
  idCancha: cancha?.idCancha || cancha?.id || 0,
  nombre: cancha?.nombre || cancha?.name || 'Cancha',
  descripcion: cancha?.descripcion || cancha?.reglasUso,
  superficie: cancha?.superficie,
  cubierta: cancha?.cubierta,
  precio:
    typeof cancha?.precio === 'number'
      ? cancha.precio
      : parseFloat(cancha?.precio || '') || undefined,
  ratingPromedio:
    typeof cancha?.ratingPromedio === 'number'
      ? cancha.ratingPromedio
      : parseFloat(cancha?.ratingPromedio || '') || undefined,
  totalResenas: cancha?.totalResenas ?? cancha?.totalReseñas ?? 0,
  dimensiones: cancha?.dimensiones,
  aforoMax: cancha?.aforoMax,
  iluminacion: cancha?.iluminacion,
  estado: cancha?.estado,
  horaApertura: cancha?.horaApertura,
  horaCierre: cancha?.horaCierre,
  disponible: cancha?.disponible,
  disciplinas: Array.isArray(cancha?.disciplinas)
    ? cancha.disciplinas.map(mapDisciplina)
    : Array.isArray(cancha?.parte)
    ? cancha.parte
        .map((p: any) => p?.disciplina)
        .filter(Boolean)
        .map(mapDisciplina)
    : [],
  fotos: Array.isArray(cancha?.fotos) ? cancha.fotos.map(mapFoto) : [],
  sede: cancha?.sede
    ? {
        idSede: cancha.sede.idSede || cancha.sede.id || 0,
        nombre: cancha.sede.nombre || cancha.sede.name,
        ciudad: cancha.sede.ciudad || cancha.sede.city,
        direccion: cancha.sede.direccion || cancha.sede.addressLine,
        telefono: cancha.sede.telefono || cancha.sede.phone,
        email: cancha.sede.email,
      }
    : undefined,
  creadoEn: cancha?.creadoEn,
  actualizadoEn: cancha?.actualizadoEn,
});

const normalizeDetail = (datos: any): CanchaAdminDetail => ({
  ...normalizeCancha(datos),
  reglasUso: datos?.reglasUso,
  parte: Array.isArray(datos?.parte)
    ? datos.parte.map((parte: any) => ({
        idParte: parte.idParte,
        disciplina: parte.disciplina ? mapDisciplina(parte.disciplina) : undefined,
      }))
    : [],
});

const buildQuery = (filters?: CanchasFilters): string => {
  if (!filters) return '';
  const params = new URLSearchParams();

  if (filters.deporte) params.append('deporte', filters.deporte);
  if (filters.precioMin !== undefined) params.append('precioMin', filters.precioMin.toString());
  if (filters.precioMax !== undefined) params.append('precioMax', filters.precioMax.toString());
  if (filters.cubierta !== undefined) params.append('cubierta', String(filters.cubierta));
  if (filters.iluminacion !== undefined) params.append('iluminacion', String(filters.iluminacion));
  if (filters.disponible !== undefined) params.append('disponible', String(filters.disponible));
  if (filters.estado) params.append('estado', filters.estado);

  return params.toString() ? `?${params.toString()}` : '';
};

export const canchasService = {
  async getBySede(idSede: number, filters?: CanchasFilters): Promise<CanchasDeSedeResponse> {
    const query = buildQuery(filters);
    const response = await apiClient.get<any>(`/sede/${idSede}/canchas${query}`);
    const data = response.data;

    return {
      idSede: data?.idSede ?? idSede,
      nombreSede: data?.nombreSede || data?.sede?.nombre || '',
      total: data?.total ?? (Array.isArray(data?.canchas) ? data.canchas.length : 0),
      canchas: Array.isArray(data?.canchas) ? data.canchas.map(normalizeCancha) : [],
    };
  },

  async getDetail(idCancha: number): Promise<CanchaAdminDetail> {
    const response = await apiClient.get<any>(`/cancha/${idCancha}`);
    return normalizeDetail(response.data);
  },

  async crear(data: CanchaCreateDto): Promise<any> {
    return adminApiClient.post('/canchas', data);
  },

  async editar(idCancha: number, data: CanchaUpdateDto): Promise<any> {
    return adminApiClient.put(`/canchas/${idCancha}/editar`, data);
  },

  async desactivar(idCancha: number, motivo: string): Promise<any> {
    return adminApiClient.put(`/canchas/${idCancha}/desactivar`, { motivo });
  },

  async eliminar(idCancha: number, motivo: string): Promise<any> {
    return adminApiClient.delete(`/canchas/${idCancha}`, {
      data: { motivo, confirmacion: true },
    });
  },
};

export default canchasService;
