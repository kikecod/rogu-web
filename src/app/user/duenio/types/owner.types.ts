export interface OwnerCourtSummary {
  id_cancha: number;
  id_sede: number;
  nombre: string;
  superficie?: string;
  precio?: number;
  aforoMax?: number;
  iluminacion?: string;
}

export interface OwnerVenue {
  id_sede: number;
  id_persona_d: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  canchas?: OwnerCourtSummary[];
}

export interface OwnerReservation {
  id_reserva: number;
  id_cliente: number;
  id_cancha: number;
  inicia_en: string;
  termina_en: string;
  monto_total?: number;
}
