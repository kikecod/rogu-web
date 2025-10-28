import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, CreditCard, QrCode, Star, MapPin, 
  Calendar, Users, Clock, Shield, AlertCircle
} from 'lucide-react';
import Footer from '../../../../../shared/components/layout/Footer';
import { ROUTE_PATHS } from '../../../../../constants';
import { createReserva } from '../../../../../shared/utils/reservas';
import { formatPrice } from '../../../../../shared/utils/format';
import { useAuth } from '../../../../../features/auth/context/AuthContext';
import type { CreateReservaRequest } from '../../../../../domain';
import { registrarDeuda } from '../../../../../features/pagos/services/pagos.service';

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

interface CheckoutLocationState {
  bookingDetails?: BookingDetails;
  fieldId?: string;
  fieldData?: unknown;
  selectedDate?: Date;
  selectedTimeSlots?: string[];
  participants?: number;
  totalPrice?: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const {
    bookingDetails,
    fieldId,
    selectedDate: rawSelectedDate,
    selectedTimeSlots = [],
    participants = 1,
    totalPrice,
  } = (location.state ?? {}) as CheckoutLocationState;

  const normalizedSelectedDate =
    rawSelectedDate instanceof Date
      ? rawSelectedDate
      : rawSelectedDate
        ? new Date(rawSelectedDate)
        : undefined;

  const bookingPrice = Number(bookingDetails?.price ?? 0);
  const totalPriceValue = Number(totalPrice ?? bookingPrice);
  const formattedBookingPrice = formatPrice(bookingPrice);
  const formattedTotalPrice = formatPrice(totalPriceValue);
  const selectedSlotsLabel = selectedTimeSlots.join(', ');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | null>('card');
  const [showErrors, setShowErrors] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay informacion de reserva</h2>
          <button
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const validateCardForm = () => true;

  const handlePayment = async () => {
    if (paymentMethod === 'card' && !validateCardForm()) {
      setShowErrors(true);
      return;
    }

    if (!paymentMethod) {
      setShowErrors(true);
      return;
    }

    // Validar que tengamos todos los datos necesarios
    if (!user || !fieldId || !normalizedSelectedDate || !selectedTimeSlots || selectedTimeSlots.length === 0) {
      alert('Faltan datos para completar la reserva');
      return;
    }

    // Validar que el usuario tenga el rol de CLIENTE
    if (!user.roles?.includes('CLIENTE')) {
      alert('Debes tener el rol de cliente para hacer reservas');
      return;
    }

    // Usar id_persona como id_cliente (el backend lo asocia asi)
    const id_cliente = user.id_persona;

    if (!id_cliente) {
      alert('No se encontro la informacion de persona del usuario');
      return;
    }

    setIsProcessing(true);

    try {
      const toIsoLocalFromParts = (dateObj: Date, timeHHmm: string) => {
        // Construye un Date con componentes locales y devuelve ISO (UTC) valido para el backend
        const [hh, mm] = timeHHmm.split(':').map((t) => parseInt(t, 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) return '';
        const d = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          hh,
          mm,
          0,
          0
        );
        return d.toISOString();
      };
      const firstSlot = selectedTimeSlots[0];
      const [startTime, endTime] = firstSlot.split(' - ');

      const year = normalizedSelectedDate.getFullYear();
      const month = String(normalizedSelectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(normalizedSelectedDate.getDate()).padStart(2, '0');

      const inicia_en = toIsoLocalFromParts(normalizedSelectedDate, startTime);
      const termina_en = toIsoLocalFromParts(normalizedSelectedDate, endTime);
      if (!inicia_en || !termina_en) {
        throw new Error('No se pudo construir la fecha/hora de la reserva.');
      }

      const reservaData: CreateReservaRequest = {
        id_cliente: Number(id_cliente),
        id_cancha: parseInt(fieldId, 10),
        inicia_en,
        termina_en,
        cantidad_personas: Number(participants),
        requiere_aprobacion: false,
        monto_base: bookingPrice,
        // Si el total difiere del precio base (ej: multiples horas o extras), calcular diferencia como extra
        monto_extra: Math.max(Number(totalPriceValue) - Number(bookingPrice), 0),
        monto_total: totalPriceValue,
      };

      const reservaResponse = await createReserva(reservaData);
      const reservaId = reservaResponse?.reserva?.id_reserva;

      if (!reservaId) {
        throw new Error('No se pudo obtener el identificador de la reserva.');
      }

      const descripcion = bookingDetails
        ? `${bookingDetails.fieldName} - ${bookingDetails.sedeName} - ${year}-${month}-${day} ${startTime}-${endTime}`
        : `Reserva ${reservaId}`;

      let pasarelaUrl: string | null = null;
      let qrUrl: string | null = null;
      try {
        const deudaResponse = await registrarDeuda({
          reserva_id: reservaId,
          descripcion,
        });
        pasarelaUrl = deudaResponse?.transaccion?.url_pasarela_pagos ?? null;
        qrUrl = deudaResponse?.transaccion?.qr_simple_url ?? null;
      } catch (err) {
        console.warn('No se pudo registrar la deuda/libelula, continuando con reserva manual:', err);
      }

      if (paymentMethod === 'qr' && qrUrl) {
        window.open(qrUrl, '_blank', 'noopener');
      } else if (pasarelaUrl) {
        window.location.href = pasarelaUrl;
        return;
      } else if (qrUrl) {
        window.open(qrUrl, '_blank', 'noopener');
      }

      navigate(ROUTE_PATHS.CHECKOUT_SUCCESS, {
        state: { reservaId, fromCheckout: true },
      });
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar el proceso de pago. Intenta nuevamente.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Sin formato de tarjeta: Libelula maneja el ingreso de datos de pago

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Solicita reservar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Elige como pagar</h2>

              {/* Libelula Payment Option (recommended) */}
              <div 
                className={`border-2 rounded-xl p-4 mb-4 cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-gray-700" />
                    <span className="font-semibold text-gray-900">Pasarela Libelula (recomendado)</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="mt-2 text-sm text-gray-600">
                    Seras redirigido a la pasarela de pagos Libelula para completar tu pago de{' '}
                    <span className="font-semibold text-gray-900">{formattedTotalPrice}</span>.
                  </div>
                )}
              </div>

              {/* QR Payment Option */}
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === 'qr' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPaymentMethod('qr')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-6 w-6 text-gray-700" />
                    <div>
                      <p className="font-semibold text-gray-900">Pago con QR</p>
                      <p className="text-xs text-gray-600 mt-1">Escanea y paga al instante</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'qr' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'qr' && (
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </div>

                {paymentMethod === 'qr' && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-fadeIn">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="h-48 w-48 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">
                          Escanea este codigo QR con tu app de banco
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {formattedTotalPrice} BOB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showErrors && !paymentMethod && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Selecciona un metodo de pago
                </p>
              )}
            </div>

            {/* Step 2: Message to Host */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Mensaje al anfitrion</h2>
              <textarea
                placeholder="Cuentale al anfitrion sobre tu equipo, nivel de juego, o cualquier solicitud especial..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Step 3: Review */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Revisa tu solicitud</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Politica de cancelacion</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cancelacion gratuita hasta 24 horas antes de tu reserva. 
                      Si cancelas dentro de las 24 horas, se aplicara un cargo del 50%.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Reglas importantes</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1 ml-4">
                      <li> Llega 10 minutos antes del horario reservado</li>
                      <li> Uso de calzado deportivo obligatorio</li>
                      <li> Respeta los horarios de inicio y fin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando reserva...
                </span>
              ) : (
                'Confirmar y pagar'
              )}
            </button>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100">
              {/* Field Image */}
              <div className="mb-5 rounded-xl overflow-hidden">
                <img
                  src={bookingDetails.fieldImage}
                  alt={bookingDetails.fieldName}
                  className="w-full h-32 object-cover"
                />
              </div>

              {/* Field Info */}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {bookingDetails.fieldName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{bookingDetails.sedeName}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  <span className="font-bold text-sm">{bookingDetails.rating}</span>
                  <span className="text-xs text-gray-600">({bookingDetails.reviews} resenas)</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs">{bookingDetails.address}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Fecha</p>
                    <p className="font-semibold text-sm">{bookingDetails.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Horario</p>
                    <p className="font-semibold text-sm">{bookingDetails.timeSlot || selectedSlotsLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Participantes</p>
                    <p className="font-semibold text-sm">{participants} personas</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <h4 className="font-bold text-gray-900">Informacion del precio</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Costo por hora</span>
                  <span className="font-semibold">{formattedBookingPrice}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">Total (BOB)</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {formattedTotalPrice}
                </span>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-xs text-green-800">
                  <span className="font-bold">Pago seguro</span> - Tu informacion esta protegida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;









