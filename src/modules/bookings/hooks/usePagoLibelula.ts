import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { crearDeudaLibelula, generarIdentificadorDeuda } from '../services/libelulaService';
import type { MetodoPago, CrearDeudaRequest } from '../types/libelula.types';
import { ROUTES } from '@/config/routes';

interface BookingDetails {
  fieldName: string;
  fieldImage: string;
  sedeName: string;
  address: string;
  date: string;
  participants: number;
  timeSlot: string;
  price: number;
  rating: number;
  reviews: number;
}

interface UsePagoLibelulaOptions {
  onError?: (error: Error) => void;
}

export const usePagoLibelula = (options?: UsePagoLibelulaOptions) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [transaccionId, setTransaccionId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pasarelaUrl, setPasarelaUrl] = useState<string | null>(null);

  /**
   * Inicia el proceso de pago con Libélula
   */
  const iniciarPago = async (
    idReserva: number,
    monto: number,
    descripcion: string,
    metodoPago: MetodoPago,
    bookingDetails: BookingDetails
  ): Promise<void> => {
    if (!user?.correo) {
      const error = new Error('No se encontró el email del usuario');
      options?.onError?.(error);
      throw error;
    }

    setLoading(true);

    try {
      // Generar identificador único de deuda
      const identificadorDeuda = generarIdentificadorDeuda(idReserva);

      console.log('💳 [PagoLibelula] Iniciando pago:', {
        idReserva,
        monto,
        metodoPago,
        email: user.correo
      });

      // Crear la deuda en Libélula
      const request: CrearDeudaRequest = {
        idReserva,
        email_cliente: user.correo,
        identificador_deuda: identificadorDeuda,
        descripcion,
        moneda: 'BOB',
        emite_factura: false,
        lineas_detalle_deuda: [
          {
            concepto: descripcion,
            cantidad: 1,
            costo_unitario: monto
          }
        ]
      };

      const response = await crearDeudaLibelula(request);

      console.log('✅ [PagoLibelula] Deuda creada exitosamente:', response);

      // Guardar los datos de respuesta
      setTransaccionId(response.transaccionId);
      setQrUrl(response.qrSimpleUrl);
      setPasarelaUrl(response.pasarelaUrl);

      // Procesar según el método de pago seleccionado
      if (metodoPago === 'qr') {
        // Para QR, navegamos a la página de espera que mostrará el QR
        console.log('📱 [PagoLibelula] Método QR seleccionado, navegando a página de espera');
        navigate(`${ROUTES.esperandoPago}?transaccionId=${response.transaccionId}&metodo=qr&qrUrl=${encodeURIComponent(response.qrSimpleUrl)}`, {
          state: {
            bookingDetails,
            paymentMethod: 'qr',
            reservaId: idReserva,
            qrUrl: response.qrSimpleUrl,
            transaccionId: response.transaccionId
          }
        });
      } else if (metodoPago === 'tarjeta') {
        // Para tarjeta, redirigimos a la página de espera y luego abrimos la pasarela
        console.log('💳 [PagoLibelula] Método tarjeta seleccionado, redirigiendo...');
        
        // Navegar a la página de espera
        navigate(`${ROUTES.esperandoPago}?transaccionId=${response.transaccionId}&metodo=tarjeta`, {
          state: {
            bookingDetails,
            paymentMethod: 'card',
            reservaId: idReserva
          }
        });
        
        // Abrir la pasarela en una nueva pestaña
        setTimeout(() => {
          window.open(response.pasarelaUrl, '_blank');
        }, 100);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [PagoLibelula] Error al iniciar pago:', error);
      setLoading(false);
      
      const err = error instanceof Error ? error : new Error('Error al procesar el pago');
      options?.onError?.(err);
      throw err;
    }
  };

  /**
   * Navega a la página de espera para QR (después de mostrar el QR en modal)
   */
  const navegarAEsperaPago = () => {
    if (transaccionId) {
      navigate(`${ROUTES.esperandoPago}?transaccionId=${transaccionId}`);
    }
  };

  /**
   * Reinicia el estado del hook
   */
  const reset = () => {
    setTransaccionId(null);
    setQrUrl(null);
    setPasarelaUrl(null);
    setLoading(false);
  };

  return {
    loading,
    transaccionId,
    qrUrl,
    pasarelaUrl,
    iniciarPago,
    navegarAEsperaPago,
    reset
  };
};
