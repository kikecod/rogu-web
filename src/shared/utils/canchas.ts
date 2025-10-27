import type {
  ApiCancha,
  ApiCanchaDetalle,
  ApiReserva,
  ApiResena,
  ApiFoto,
  ApiParte,
  ApiSede,
  SportField,
  Review,
  SportType,
} from '../../domain';
import { getApiUrl, getImageUrl } from '../../lib/config/api';
import { generateAvailabilitySlots } from './reservas';
import { generateAvatarUrl, getSportFieldImages } from './media';

const toStringId = (raw: unknown, fallback = '0'): string => {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'number') return Number.isFinite(raw) ? String(raw) : fallback;
  const textValue = String(raw).trim();
  return textValue.length > 0 ? textValue : fallback;
};

const createDefaultSede = (): ApiSede => ({
  idSede: 0,
  nombre: 'Sede sin nombre',
  direccion: '',
  ciudad: '',
  telefono: '',
  email: '',
  horarioApertura: '08:00',
  horarioCierre: '22:00',
  descripcion: '',
});

export const mapSuperficieToSport = (superficie: string): SportType => {
  const superficieMap: Record<string, SportType> = {
    parquet: 'basketball',
    cesped: 'football',
    'cesped sintetico': 'football',
    'tierra batida': 'tennis',
    'polvo de ladrillo': 'tennis',
    arena: 'volleyball',
    paddle: 'paddle',
    hielo: 'hockey',
  };

  const normalized = superficie
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [key, value] of Object.entries(superficieMap)) {
    if (normalized.includes(key)) return value;
  }
  return 'football';
};

export const mapSuperficieToAmenities = (cancha: ApiCancha): string[] => {
  const amenities: string[] = [];
  if (cancha.cubierta) amenities.push('Techado');
  if (cancha.iluminacion && cancha.iluminacion !== 'No disponible') {
    amenities.push('Iluminacion');
  }
  amenities.push(`Superficie: ${cancha.superficie}`);
  if (cancha.aforoMax > 0) amenities.push(`Capacidad: ${cancha.aforoMax}`);
  return amenities;
};

const resolveFotoUrl = (
  foto: ApiFoto | Record<string, unknown> | null | undefined,
): string | null => {
  if (!foto) return null;
  if (typeof (foto as ApiFoto).urlFoto === 'string') {
    return getImageUrl((foto as ApiFoto).urlFoto);
  }
  const fotoRecord = foto as Record<string, unknown>;
  if (typeof fotoRecord.url_foto === 'string') {
    return getImageUrl(String(fotoRecord.url_foto));
  }
  if (typeof fotoRecord.url === 'string') {
    return getImageUrl(String(fotoRecord.url));
  }
  return null;
};

const toDisciplinaName = (
  parte: ApiParte | Record<string, unknown> | null | undefined,
): string | null => {
  if (!parte) return null;
  const parteRecord = parte as Record<string, unknown>;
  const disciplinaRaw =
    (parte as ApiParte).disciplina ??
    (parteRecord.disciplina as Record<string, unknown> | undefined);

  if (
    disciplinaRaw &&
    typeof (disciplinaRaw as { nombre?: unknown }).nombre === 'string'
  ) {
    const nombre = (disciplinaRaw as { nombre: string }).nombre.trim();
    if (nombre.length > 0) return nombre;
  }

  const nombreDirecto = parteRecord.nombre ?? parteRecord.disciplina_nombre;
  if (typeof nombreDirecto === 'string' && nombreDirecto.trim().length > 0) {
    return nombreDirecto.trim();
  }

  const id =
    (parte as ApiParte).id_disciplina ??
    (typeof parteRecord.id_disciplina === 'number'
      ? parteRecord.id_disciplina
      : typeof parteRecord.idDisciplina === 'number'
        ? parteRecord.idDisciplina
        : null);

  return typeof id === 'number' ? `Disciplina ${id}` : null;
};

const extractDisciplineNames = (
  partes: ApiCancha['parte'] | Record<string, unknown>[] | null | undefined,
): string[] => {
  if (!partes || !Array.isArray(partes)) return [];
  const names = partes
    .map((parte) => toDisciplinaName(parte as ApiParte | Record<string, unknown>))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(names));
};

const mapResenaToReview = (resena: ApiResena): Review => ({
  id: resena.idResena,
  user: {
    name: resena.usuario?.nombre || 'Usuario',
    avatar: resena.usuario?.avatar
      ? getImageUrl(resena.usuario.avatar)
      : generateAvatarUrl('Usuario'),
  },
  rating: resena.calificacion,
  date: new Date(resena.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  comment: resena.comentario,
});

export const convertApiCanchaToSportField = (apiCancha: ApiCancha): SportField => {
  const sedeInfo: ApiSede = apiCancha.sede ?? createDefaultSede();

  const images =
    apiCancha.fotos && apiCancha.fotos.length > 0
      ? apiCancha.fotos
          .map((foto) => resolveFotoUrl(foto))
          .filter((url): url is string => Boolean(url))
      : getSportFieldImages(mapSuperficieToSport(apiCancha.superficie));

  const price = parseFloat(apiCancha.precio ?? '0') || 0;

  const reservasList: ApiReserva[] = Array.isArray(apiCancha.reservas)
    ? (apiCancha.reservas as ApiReserva[])
    : [];

  const availability = generateAvailabilitySlots(
    sedeInfo.horarioApertura || '08:00',
    sedeInfo.horarioCierre || '22:00',
    reservasList,
    price,
  );

  const canchaRecord = apiCancha as Record<string, unknown>;
  const disciplineNames = extractDisciplineNames(
    apiCancha.parte ??
      (Array.isArray(canchaRecord.parte) ? (canchaRecord.parte as ApiParte[]) : undefined),
  );
  const amenities = mapSuperficieToAmenities(apiCancha);
  if (disciplineNames.length > 0) {
    amenities.push(`Disciplinas: ${disciplineNames.join(', ')}`);
  }
  const sedeId = toStringId(
    apiCancha.id_Sede ??
      (typeof canchaRecord.id_sede === 'number' || typeof canchaRecord.id_sede === 'string'
        ? canchaRecord.id_sede
        : undefined) ??
      (typeof canchaRecord.idSede === 'number' || typeof canchaRecord.idSede === 'string'
        ? canchaRecord.idSede
        : undefined) ??
      apiCancha.sede?.idSede,
  );

  return {
    id: toStringId(apiCancha.id_cancha),
    sedeId,
    name: apiCancha.nombre ?? 'Cancha sin nombre',
    description:
      sedeInfo.descripcion ||
      apiCancha.reglasUso ||
      'Cancha deportiva disponible para reservas',
    images,
    price,
    sport: mapSuperficieToSport(apiCancha.superficie),
    amenities,
    disciplines: disciplineNames,
    availability,
    rating: 0,
    reviews: 0,
    location: {
      address: sedeInfo.direccion ?? '',
      city: sedeInfo.ciudad && sedeInfo.ciudad !== 'N/A' ? sedeInfo.ciudad : '',
      coordinates: { lat: 0, lng: 0 },
    },
    owner: {
      id: sedeId,
      name: sedeInfo.nombre ?? 'Sede sin nombre',
      avatar: generateAvatarUrl(sedeInfo.nombre ?? 'Sede'),
    },
    surface: apiCancha.superficie,
    size: apiCancha.dimensiones,
    indoor: Boolean(apiCancha.cubierta),
    lighting: apiCancha.iluminacion,
    rules:
      typeof apiCancha.reglasUso === 'string' && apiCancha.reglasUso.trim().length > 0
        ? apiCancha.reglasUso.split(',').map((r) => r.trim())
        : [],
    capacity: apiCancha.aforoMax,
    openingHours: {
      open: sedeInfo.horarioApertura ?? '08:00',
      close: sedeInfo.horarioCierre ?? '22:00',
    },
    reviewsList: [],
  };
};

export const convertApiCanchaDetalleToSportField = (
  cancha: ApiCanchaDetalle,
  reservas: ApiReserva[],
  resenas: ApiResena[],
): SportField => {
  const sport = mapSuperficieToSport(cancha.superficie);

  const images =
    cancha.fotos && cancha.fotos.length > 0
      ? cancha.fotos
          .map((foto) => resolveFotoUrl(foto))
          .filter((url): url is string => Boolean(url))
      : getSportFieldImages(sport);

  const amenities: string[] = [];
  if (cancha.cubierta) amenities.push('Techado');
  if (cancha.iluminacion && cancha.iluminacion !== 'No disponible') {
    amenities.push(`Iluminacion ${cancha.iluminacion}`);
  }
  amenities.push(`Superficie: ${cancha.superficie}`);
  amenities.push(`Capacidad: ${cancha.aforoMax} personas`);
  if (cancha.dimensiones) amenities.push(`Dimensiones: ${cancha.dimensiones}`);

  let rating = 4.5;
  let reviewsCount = 0;
  if (resenas && resenas.length > 0) {
    const sum = resenas.reduce((acc, resena) => acc + resena.calificacion, 0);
    rating = parseFloat((sum / resenas.length).toFixed(1));
    reviewsCount = resenas.length;
  }

  const sedeInfo: ApiSede = cancha.sede ?? createDefaultSede();

  const price = parseFloat(cancha.precio ?? '0') || 0;

  const availability = generateAvailabilitySlots(
    sedeInfo.horarioApertura || '08:00',
    sedeInfo.horarioCierre || '22:00',
    reservas,
    price,
  );

  const canchaRecord = cancha as Record<string, unknown>;
  const disciplineNames = extractDisciplineNames(
    cancha.parte ??
      (Array.isArray(canchaRecord.parte) ? (canchaRecord.parte as ApiParte[]) : undefined),
  );
  if (disciplineNames.length > 0) {
    amenities.push(`Disciplinas: ${disciplineNames.join(', ')}`);
  }
  const idCancha = toStringId(
    cancha.id_cancha ??
      (typeof canchaRecord.idCancha === 'number' || typeof canchaRecord.idCancha === 'string'
        ? canchaRecord.idCancha
        : undefined),
  );
  const sedeId = toStringId(
    cancha.id_Sede ??
      (typeof canchaRecord.id_sede === 'number' || typeof canchaRecord.id_sede === 'string'
        ? canchaRecord.id_sede
        : undefined) ??
      (typeof canchaRecord.idSede === 'number' || typeof canchaRecord.idSede === 'string'
        ? canchaRecord.idSede
        : undefined) ??
      sedeInfo.idSede,
  );

  return {
    id: idCancha,
    sedeId: sedeId,
    name: cancha.nombre ?? 'Cancha sin nombre',
    description:
      sedeInfo.descripcion ||
      cancha.reglasUso ||
      'Cancha deportiva disponible para reservas',
    images,
    price,
    sport,
    amenities,
    availability,
    rating,
    reviews: reviewsCount,
    location: {
      address: sedeInfo.direccion ?? '',
      city: sedeInfo.ciudad && sedeInfo.ciudad !== 'N/A' ? sedeInfo.ciudad : '',
      coordinates: { lat: 0, lng: 0 },
    },
    owner: {
      id: sedeId,
      name: sedeInfo.nombre ?? 'Sede sin nombre',
      avatar: generateAvatarUrl(sedeInfo.nombre ?? 'Sede'),
    },
    disciplines: disciplineNames,
    surface: cancha.superficie,
    size: cancha.dimensiones,
    indoor: Boolean(cancha.cubierta),
    lighting: cancha.iluminacion,
    rules:
      typeof cancha.reglasUso === 'string' && cancha.reglasUso.trim().length > 0
        ? cancha.reglasUso.split(',').map((r) => r.trim())
        : [],
    capacity: cancha.aforoMax,
    openingHours: {
      open: sedeInfo.horarioApertura || '08:00',
      close: sedeInfo.horarioCierre || '22:00',
    },
    reviewsList: resenas.map(mapResenaToReview),
  };
};

export const fetchCanchas = async (): Promise<SportField[]> => {
  const response = await fetch(getApiUrl('/cancha'));
  if (!response.ok) {
    throw new Error(`Error al obtener canchas: ${response.statusText}`);
  }
  const data: ApiCancha[] = await response.json();
  const canchasDisponibles = data.filter(
    (cancha) => cancha.estado.toLowerCase() === 'disponible' && !cancha.eliminadoEn,
  );
  return canchasDisponibles.map(convertApiCanchaToSportField);
};

export const fetchCanchaById = async (id: string): Promise<SportField> => {
  const canchaResponse = await fetch(getApiUrl(`/cancha/${id}`));
  if (!canchaResponse.ok) {
    throw new Error(`Error al obtener cancha: ${canchaResponse.statusText}`);
  }
  const canchaData: ApiCanchaDetalle = await canchaResponse.json();

  let reservasData: ApiReserva[] = [];
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const roles: string[] = userRaw ? (JSON.parse(userRaw)?.roles ?? []) : [];
    const canQueryProtected = token && (roles.includes('DUENIO') || roles.includes('ADMIN'));
    if (canQueryProtected) {
      const reservasResponse = await fetch(getApiUrl(`/reservas/cancha/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reservasResponse.ok) {
        reservasData = await reservasResponse.json();
      }
    }
  } catch {
    // swallow but log?
    console.warn('No se pudieron obtener reservas protegidas para la cancha');
  }

  let resenasData: ApiResena[] = [];
  try {
    const token = localStorage.getItem('token');
    const resenasResponse = await fetch(getApiUrl(`/califica-cancha/cancha/${id}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (resenasResponse.ok) {
      resenasData = await resenasResponse.json();
    }
  } catch {
    console.warn('No se pudieron obtener resenas de la cancha');
  }

  return convertApiCanchaDetalleToSportField(canchaData, reservasData, resenasData);
};





