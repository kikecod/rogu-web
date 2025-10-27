import type { OwnerCourtSummary, OwnerVenue } from '../types/owner.types';

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const mapCourtSummary = (raw: unknown): OwnerCourtSummary | null => {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const idCancha = toNumber(record.id_cancha ?? record.idCancha);
  if (typeof idCancha === 'undefined') return null;
  const idSede = toNumber(record.id_sede ?? record.idSede) ?? 0;

  return {
    id_cancha: idCancha,
    id_sede: idSede,
    nombre: typeof record.nombre === 'string' && record.nombre.trim().length > 0
      ? record.nombre
      : `Cancha ${idCancha}`,
    superficie: typeof record.superficie === 'string' ? record.superficie : undefined,
    precio: toNumber(record.precio),
    aforoMax: toNumber(record.aforoMax ?? record.aforo_max),
    iluminacion: typeof record.iluminacion === 'string' ? record.iluminacion : undefined,
  };
};

export const mapToOwnerVenue = (raw: unknown): OwnerVenue | null => {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const idSede = toNumber(record.id_sede ?? record.idSede);
  const idPersona = toNumber(record.id_persona_d ?? record.idPersonaD ?? record.id_persona);
  if (typeof idSede === 'undefined' || typeof idPersona === 'undefined') return null;

  const canchasRaw = Array.isArray(record.canchas) ? record.canchas : [];
  const canchas = canchasRaw
    .map(mapCourtSummary)
    .filter((court): court is OwnerCourtSummary => court !== null);

  return {
    id_sede: idSede,
    id_persona_d: idPersona,
    nombre: typeof record.nombre === 'string' && record.nombre.trim().length > 0
      ? record.nombre
      : `Sede ${idSede}`,
    descripcion: typeof record.descripcion === 'string' ? record.descripcion : undefined,
    direccion: typeof record.direccion === 'string' ? record.direccion : undefined,
    telefono: typeof record.telefono === 'string' ? record.telefono : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    canchas,
  };
};

export const mapToOwnerCourtSummary = (raw: unknown): OwnerCourtSummary | null => mapCourtSummary(raw);
