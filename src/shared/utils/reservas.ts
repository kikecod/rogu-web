import type {
  ApiReserva,
  TimeSlot,
  CreateReservaRequest,
  CreateReservaResponse,
} from '../../domain';
import { getApiUrl } from '../../lib/config/api';

const normalizeHora = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    if (value.includes('T')) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toTimeString().slice(0, 5);
    }
    return value.length >= 5 ? value.slice(0, 5) : null;
  }
  if (value instanceof Date) {
    return value.toTimeString().slice(0, 5);
  }
  return null;
};

export const generateAvailabilitySlots = (
  horarioApertura: string,
  horarioCierre: string,
  reservas: ApiReserva[],
  precio: number,
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();

  const [openHour] = horarioApertura.split(':').map(Number);
  const [closeHour] = horarioCierre.split(':').map(Number);

  for (let hour = openHour; hour < closeHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    const isReserved = reservas.some((reserva) => {
      if (reserva.estado === 'Cancelada') return false;

      const reservaRecord = reserva as Record<string, unknown>;
      const startHora =
        normalizeHora(
          (reservaRecord.horaInicio as string | undefined) ??
            (reservaRecord.hora_inicio as string | undefined) ??
            (reservaRecord.inicia_en as string | undefined),
        ) ?? normalizeHora(reservaRecord.fecha_inicio as string | undefined);
      const endHora =
        normalizeHora(
          (reservaRecord.horaFin as string | undefined) ??
            (reservaRecord.hora_fin as string | undefined) ??
            (reservaRecord.termina_en as string | undefined),
        ) ?? normalizeHora(reservaRecord.fecha_fin as string | undefined);

      if (!startHora || !endHora) return false;
      return startTime >= startHora && startTime < endHora;
    });

    slots.push({
      date: today.toISOString().split('T')[0],
      startTime,
      endTime,
      available: !isReserved,
      price: precio,
    });
  }

  return slots;
};

const normalizeISO = (value: unknown): string => {
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  } else if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) return value.toISOString();
  }
  return '';
};

export const createReserva = async (
  reservaData: CreateReservaRequest,
): Promise<CreateReservaResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Debes iniciar sesion para hacer una reserva');
  }

  const payload: CreateReservaRequest = {
    ...reservaData,
    id_cliente: Number(reservaData.id_cliente),
    id_cancha: Number(reservaData.id_cancha),
    inicia_en: normalizeISO(reservaData.inicia_en),
    termina_en: normalizeISO(reservaData.termina_en),
    cantidad_personas: Number(reservaData.cantidad_personas),
    requiere_aprobacion: Boolean(reservaData.requiere_aprobacion),
    monto_base: Number(reservaData.monto_base),
    monto_extra: Number(reservaData.monto_extra),
    monto_total: Number(reservaData.monto_total),
  };

  if (!payload.inicia_en || !payload.termina_en) {
    throw new Error('inicia_en/termina_en invalidos. Selecciona fecha y horario validos.');
  }

  const response = await fetch(`${getApiUrl('/reservas')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        message = Array.isArray(errorData.message)
          ? errorData.message.join('; ')
          : String(errorData.message);
      } else if (errorData?.error) {
        message = String(errorData.error);
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) message = `${message} - ${text}`;
    }
    throw new Error(message);
  }

  return response.json();
};
