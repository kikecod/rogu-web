// ==========================================
// TIPOS PARA INTEGRACIÓN CON LIBÉLULA
// ==========================================

export interface LineaDetalleDeuda {
  concepto: string;
  cantidad: number;
  costo_unitario: number;
}

export interface CrearDeudaRequest {
  idReserva: number;
  email_cliente: string;
  identificador_deuda: string;
  descripcion: string;
  moneda: 'BOB';
  emite_factura: boolean;
  lineas_detalle_deuda: LineaDetalleDeuda[];
}

export interface CrearDeudaResponse {
  pasarelaUrl: string;
  transaccionId: string;
  qrSimpleUrl: string;
  mensaje: string;
}

export type MetodoPago = 'qr' | 'tarjeta';

export interface PagoCompletadoPayload {
  reservaId: number;
  mensaje: string;
}
