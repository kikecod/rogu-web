import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, Download } from 'lucide-react';
import { suscribirseATransaccion, onPagoCompletado, disconnectSocket } from '../services/socketService';
import { ROUTES } from '@/config/routes';

const EsperandoPagoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccionId');
  const metodo = searchParams.get('metodo') as 'qr' | 'tarjeta' | null;
  const qrUrlParam = searchParams.get('qrUrl');

  const bookingDetails = location.state?.bookingDetails;
  const reservaIdState = location.state?.reservaId as number | undefined;
  const qrUrl = location.state?.qrUrl || (qrUrlParam ? decodeURIComponent(qrUrlParam) : null);

  const [estado, setEstado] = useState<'esperando' | 'completado' | 'error'>('esperando');
  const [mensaje, setMensaje] = useState('Esperando confirmacion del pago...');
  const [reservaId, setReservaId] = useState<number | null>(null);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);

  useEffect(() => {
    if (!transaccionId) {
      console.error('[EsperandoPago] No se proporciono transaccionId');
      setEstado('error');
      setMensaje('Error: No se encontro el identificador de la transaccion');
      return;
    }

    console.log('[EsperandoPago] Iniciando escucha para transaccion:', transaccionId);

    // Suscribirse a la transaccion
    suscribirseATransaccion(transaccionId);

    const handlePagoCompletado = (data: any) => {
      const resolvedReservaId =
        data?.reservaId ||
        data?.idReserva ||
        data?.reserva?.idReserva ||
        reservaIdState ||
        null;

      if (!resolvedReservaId) {
        console.warn('[EsperandoPago] Evento de pago recibido sin reservaId', data);
        return;
      }

      const mensajePago = data?.mensaje || data?.message || 'Pago confirmado';

      console.log('[EsperandoPago] Pago completado:', data);
      setEstado('completado');
      setMensaje(mensajePago);
      setReservaId(resolvedReservaId);

      // Redirigir despues de 2 segundos
      setTimeout(() => {
        navigate(ROUTES.bookingConfirmation(resolvedReservaId), {
          replace: true,
          state: {
            bookingDetails,
            paymentMethod: metodo === 'qr' ? 'qr' : 'card',
            reservaId: resolvedReservaId
          }
        });
      }, 2000);
    };

    // Escuchar cuando el pago se complete
    const cleanup = onPagoCompletado(handlePagoCompletado);

    // Timeout de seguridad (5 minutos)
    const timeout = setTimeout(() => {
      console.warn('[EsperandoPago] Timeout alcanzado');
      setEstado('error');
      setMensaje('El tiempo de espera ha expirado. Por favor verifica el estado de tu pago.');
    }, 5 * 60 * 1000);

    // Cleanup
    return () => {
      cleanup();
      clearTimeout(timeout);
      disconnectSocket();
    };
  }, [transaccionId, navigate, reservaIdState, bookingDetails, metodo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          {estado === 'esperando' && (
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
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

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {estado === 'esperando' && 'Procesando tu pago'}
          {estado === 'completado' && 'Pago exitoso!'}
          {estado === 'error' && 'Ha ocurrido un error'}
        </h1>

        <p className="text-center text-gray-600 mb-6">
          {mensaje}
        </p>

        {estado === 'esperando' && metodo === 'qr' && qrUrl && (
          <div className="mb-6">
            <div className="bg-white border-4 border-green-500 rounded-2xl p-6 mb-4 shadow-lg relative">
              {!qrImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
              )}

              <img
                src={qrUrl}
                alt="Codigo QR de pago"
                className={`w-full h-auto transition-opacity duration-300 ${
                  qrImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setQrImageLoaded(true)}
                onError={() => {
                  console.error('Error al cargar el QR');
                  setQrImageLoaded(true);
                }}
              />

              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-green-600 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-green-600 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-green-600 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-green-600 rounded-br-lg" />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Escanea el codigo QR:</h3>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Abre tu app de banco o billetera digital</li>
                    <li>Selecciona "Escanear QR" o "Pagar con QR"</li>
                    <li>Apunta tu camara al codigo</li>
                    <li>Confirma el pago en tu app</li>
                  </ol>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrUrl;
                link.download = `qr-pago-${transaccionId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar codigo QR
            </button>
          </div>
        )}

        {estado === 'esperando' && metodo === 'tarjeta' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center mb-3">
              Completa el pago en la ventana de Libelula que se abrio.
            </p>
            <p className="text-sm text-blue-800 text-center">
              No cierres esta ventana. Te redirigiremos automaticamente cuando se confirme el pago.
            </p>
            {transaccionId && (
              <p className="text-xs text-blue-600 text-center mt-2 font-mono">
                ID: {transaccionId.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {estado === 'esperando' && !metodo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              No cierres esta ventana. Estamos esperando la confirmacion del pago...
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
              Redirigiendo a tu confirmacion de reserva...
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
