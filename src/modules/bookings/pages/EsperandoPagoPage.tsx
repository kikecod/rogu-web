import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { suscribirseATransaccion, onPagoCompletado, disconnectSocket } from '../services/socketService';
import { ROUTES } from '@/config/routes';

const EsperandoPagoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccionId');

  const [estado, setEstado] = useState<'esperando' | 'completado' | 'error'>('esperando');
  const [mensaje, setMensaje] = useState('Esperando confirmación del pago...');
  const [reservaId, setReservaId] = useState<number | null>(null);

  useEffect(() => {
    if (!transaccionId) {
      console.error('❌ [EsperandoPago] No se proporcionó transaccionId');
      setEstado('error');
      setMensaje('Error: No se encontró el identificador de la transacción');
      return;
    }

    console.log('🔄 [EsperandoPago] Iniciando escucha para transacción:', transaccionId);

    // Suscribirse a la transacción
    suscribirseATransaccion(transaccionId);

    // Escuchar cuando el pago se complete
    const cleanup = onPagoCompletado((data) => {
      console.log('✅ [EsperandoPago] Pago completado:', data);
      setEstado('completado');
      setMensaje(data.mensaje);
      setReservaId(data.reservaId);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(ROUTES.bookingConfirmation(data.reservaId), {
          replace: true
        });
      }, 2000);
    });

    // Timeout de seguridad (5 minutos)
    const timeout = setTimeout(() => {
      console.warn('⏰ [EsperandoPago] Timeout alcanzado');
      setEstado('error');
      setMensaje('El tiempo de espera ha expirado. Por favor verifica el estado de tu pago.');
    }, 5 * 60 * 1000);

    // Cleanup
    return () => {
      cleanup();
      clearTimeout(timeout);
      disconnectSocket();
    };
  }, [transaccionId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Icono principal */}
        <div className="flex justify-center mb-6">
          {estado === 'esperando' && (
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              {/* Animación de pulso */}
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
            </div>
          )}
          
          {estado === 'completado' && (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}
          
          {estado === 'error' && (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {estado === 'esperando' && 'Procesando tu pago'}
          {estado === 'completado' && '¡Pago exitoso!'}
          {estado === 'error' && 'Ha ocurrido un error'}
        </h1>

        {/* Mensaje */}
        <p className="text-center text-gray-600 mb-6">
          {mensaje}
        </p>

        {/* Información adicional */}
        {estado === 'esperando' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              No cierres esta ventana. Estamos esperando la confirmación del pago...
            </p>
            {transaccionId && (
              <p className="text-xs text-blue-600 text-center mt-2 font-mono">
                ID: {transaccionId.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {estado === 'completado' && reservaId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 text-center">
              Redirigiendo a tu confirmación de reserva...
            </p>
            <p className="text-xs text-green-600 text-center mt-2">
              Reserva #{reservaId}
            </p>
          </div>
        )}

        {estado === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate(ROUTES.bookings)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver mis reservas
            </button>
            <button
              onClick={() => navigate(ROUTES.home)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Indicador de progreso */}
        {estado === 'esperando' && (
          <div className="mt-6">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EsperandoPagoPage;
