import type { Cancha } from '@/search/types';
import type { SedeCard } from '@/venues/types/venue-search.types';

interface AggregatedStats {
  deportesDisponibles: Set<string>;
  totalCanchas: number;
  precios: number[];
  ratings: number[];
  resenas: number[];
}

/**
 * Convierte resultados de canchas (búsqueda con fecha/horario) a una lista de sedes únicas
 * con estadísticas mínimas para la UI pública.
 */
export const mapCanchasToSedes = (canchas: Cancha[]): SedeCard[] => {
  const bySede = new Map<number, { sede: SedeCard; stats: AggregatedStats }>();

  canchas.forEach((cancha) => {
    const sede = cancha.sede;
    if (!sede?.idSede) return;

    const existing = bySede.get(sede.idSede);
    const deportes = new Set<string>(existing?.stats.deportesDisponibles || []);
    cancha.disciplinas?.forEach((d: { nombre: string }) => deportes.add(d.nombre));

    const precios = existing ? existing.stats.precios : [];
    if (typeof cancha.precio === 'number') precios.push(cancha.precio);

    const ratings = existing ? existing.stats.ratings : [];
    if (typeof cancha.ratingPromedio === 'number') ratings.push(cancha.ratingPromedio);

    const resenas = existing ? existing.stats.resenas : [];
    if (typeof cancha.totalResenas === 'number') resenas.push(cancha.totalResenas);

    const stats: AggregatedStats = {
      deportesDisponibles: deportes,
      totalCanchas: (existing?.stats.totalCanchas || 0) + 1,
      precios,
      ratings,
      resenas,
    };

    const precioDesde = stats.precios.length ? Math.min(...stats.precios) : 0;
    const precioHasta = stats.precios.length ? Math.max(...stats.precios) : precioDesde;
    const ratingFinal = stats.ratings.length
      ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
      : 0;
    const totalResenas =
      stats.resenas.length && stats.resenas.some((n) => Number.isFinite(n))
        ? stats.resenas.reduce((a, b) => a + b, 0)
        : 0;

    const baseSede: SedeCard = {
      idSede: sede.idSede,
      nombre: sede.nombre,
      country: sede.country,
      stateProvince: sede.stateProvince,
      city: sede.city,
      district: sede.district,
      addressLine: sede.addressLine,
      latitude: sede.latitude,
      longitude: sede.longitude,
      telefono: sede.telefono,
      email: sede.telefono || '',
      fotoPrincipal: undefined,
      fotos: [],
      estadisticas: {
        totalCanchas: stats.totalCanchas,
        deportesDisponibles: Array.from(stats.deportesDisponibles),
        precioDesde,
        precioHasta,
        ratingGeneral: ratingFinal,
        ratingCanchas: ratingFinal,
        ratingFinal,
        totalResenasSede: 0,
        totalResenasCanchas: totalResenas,
      },
      duenio: existing?.sede.duenio || {
        idUsuario: 0,
        nombre: 'Administrador',
        apellido: '',
        correo: 'no-disponible',
        telefono: '',
      },
      descripcion: existing?.sede.descripcion || '',
      verificada: existing?.sede.verificada,
    };

    bySede.set(sede.idSede, { sede: baseSede, stats });
  });

  return Array.from(bySede.values()).map((item) => item.sede);
};
