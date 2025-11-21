import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, CreditCard, QrCode, Star, MapPin, 
  Calendar, Users, Clock, Shield, AlertCircle
} from 'lucide-react';
import Footer from '@/components/Footer';
import { createReserva } from '@/core/lib/helpers';
import { useAuth } from '@/auth/hooks/useAuth';
import type { CreateReservaRequest } from '../types/booking.types';
import { ROUTES } from '@/config/routes';
import { usePagoLibelula } from '../hooks/usePagoLibelula';

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

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const bookingDetails = location.state?.bookingDetails as BookingDetails;
  const fieldId = location.state?.fieldId;
  const selectedDate = location.state?.selectedDate as Date;
  const selectedTimeSlots = location.state?.selectedTimeSlots as string[];
  const participants = location.state?.participants;
  const totalPrice = location.state?.totalPrice;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | null>(null);
  const [showErrors] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idReserva, setIdReserva] = useState<number | null>(location.state?.idReserva || null);
  const [isCreatingReserva, setIsCreatingReserva] = useState(false);
  
  // Hook de pago con Libélula
  const { iniciarPago } = usePagoLibelula({
    onError: (error) => {
      alert(error.message);
      setIsProcessing(false);
    }
  });
  
  // Ref para prevenir doble creación de reserva
  const reservaCreatedRef = useRef(false);

  // Crear reserva PENDIENTE al montar el componente
  useEffect(() => {
    const createPendingReserva = async () => {
      // Prevenir doble ejecución en React StrictMode
      if (reservaCreatedRef.current) {
        console.log('⚠️ [Checkout] Reserva ya fue creada, saltando...');
        return;
      }

      // Si ya existe idReserva (viene desde MyBookings), no crear otra
      if (idReserva) {
        console.log('💡 [Checkout] Ya existe idReserva, no se crea nueva reserva:', idReserva);
        reservaCreatedRef.current = true;
        return;
      }

      // Validar que tengamos todos los datos necesarios
      if (!user || !fieldId || !selectedDate || !selectedTimeSlots || selectedTimeSlots.length === 0) {
        console.error('❌ [Checkout] Faltan datos para crear reserva');
        console.log('🆕 [Checkout] Creando reserva PENDIENTE para campo:', fieldId, user, selectedTimeSlots);
        return;
      }

      

      // Validar que el usuario tenga el rol de CLIENTE
      if (!user.roles?.includes('CLIENTE')) {
        console.error('❌ [Checkout] Usuario no tiene rol de CLIENTE');
        return;
      }

      const idCliente = user.idPersona;
      if (!idCliente) {
        console.error('❌ [Checkout] No se encontró idPersona del usuario');
        return;
      }

      // Marcar como en proceso ANTES de hacer la petición
      reservaCreatedRef.current = true;
      setIsCreatingReserva(true);

      try {
        // Validar y procesar horarios consecutivos
        const validateAndMergeTimeSlots = (slots: string[]): { startTime: string; endTime: string } | null => {
          if (slots.length === 0) return null;
          
          const parsedSlots = slots.map(slot => {
            const [start, end] = slot.split(' - ');
            return { start, end };
          });
          
          parsedSlots.sort((a, b) => a.start.localeCompare(b.start));
          
          for (let i = 0; i < parsedSlots.length - 1; i++) {
            const currentEnd = parsedSlots[i].end;
            const nextStart = parsedSlots[i + 1].start;
            
            if (currentEnd !== nextStart) {
              return null;
            }
          }
          
          return {
            startTime: parsedSlots[0].start,
            endTime: parsedSlots[parsedSlots.length - 1].end
          };
        };

        const timeRange = validateAndMergeTimeSlots(selectedTimeSlots);
        
        if (!timeRange) {
          alert('Los horarios seleccionados deben ser consecutivos.');
          navigate(-1);
          return;
        }

        // Crear timestamps ISO
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        
        const iniciaEn = `${year}-${month}-${day}T${timeRange.startTime}:00`;
        const terminaEn = `${year}-${month}-${day}T${timeRange.endTime}:00`;

        const reservaData: CreateReservaRequest = {
          idCliente: idCliente,
          idCancha: parseInt(fieldId),
          iniciaEn: iniciaEn,
          terminaEn: terminaEn,
          cantidadPersonas: participants || 1,
          requiereAprobacion: false,
          montoBase: totalPrice || 0,
          montoExtra: 0,
          montoTotal: totalPrice || 0
        };

        console.log('🆕 [Checkout] Creando reserva PENDIENTE:', reservaData);

        // Crear la reserva PENDIENTE en el backend
        const response = await createReserva(reservaData);
        
        console.log('✅ [Checkout] Reserva PENDIENTE creada:', response);
        console.log('🎫 [Checkout] idReserva:', response.reserva.idReserva);
        console.log('📊 [Checkout] Estado:', response.reserva.estado);

        setIdReserva(response.reserva.idReserva);
      } catch (error) {
        console.error('❌ [Checkout] Error al crear reserva PENDIENTE:', error);
        // Resetear el ref si hay error para permitir reintentar
        reservaCreatedRef.current = false;
        alert(error instanceof Error ? error.message : 'Error al crear la reserva. Por favor intenta de nuevo.');
        navigate(-1);
      } finally {
        setIsCreatingReserva(false);
      }
    };

    createPendingReserva();
  }, []); // ← Dependencias vacías, solo se ejecuta una vez

  // Scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay información de reserva</h2>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    // Validar que haya un método de pago seleccionado
    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    // Validar que tengamos idReserva
    if (!idReserva || !totalPrice) {
      alert('No se ha creado la reserva. Por favor recarga la página e intenta de nuevo.');
      return;
    }

    setIsProcessing(true);

    try {
      const descripcion = `Reserva de ${bookingDetails.fieldName} - ${bookingDetails.date} ${bookingDetails.timeSlot}`;
      
      console.log('💳 [Checkout] Iniciando pago con Libélula:', {
        idReserva,
        monto: totalPrice,
        metodo: paymentMethod
      });

      // Iniciar el pago con Libélula
      const metodoPago = paymentMethod === 'card' ? 'tarjeta' : 'qr';
      await iniciarPago(
        idReserva, 
        totalPrice, 
        descripcion, 
        metodoPago,
        bookingDetails
      );

      // El hook maneja la navegación automáticamente
    } catch (error) {
      console.error('❌ [Checkout] Error al procesar pago:', error);
      setIsProcessing(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Loader mientras se crea la reserva */}
      {isCreatingReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Creando tu reserva...</h3>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        </div>
      )}

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
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Agrega un método de pago</h2>

              {/* Card Payment Option */}
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
                    <span className="font-semibold text-gray-900">Tarjeta de crédito o débito</span>
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
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Pago con tarjeta</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          Serás redirigido a la pasarela segura de <strong>Libélula</strong> para completar tu pago con tarjeta de crédito o débito.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>Pago 100% seguro y encriptado</span>
                        </div>
                      </div>
                    </div>
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
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Pago con código QR</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          Se generará un código QR que podrás escanear con tu aplicación de banca móvil o billetera digital para completar el pago de forma rápida y segura.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>Procesado por Libélula</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showErrors && !paymentMethod && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Selecciona un método de pago
                </p>
              )}
            </div>

            {/* Step 2: Message to Host */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Mensaje al anfitrión</h2>
              <textarea
                placeholder="Cuéntale al anfitrión sobre tu equipo, nivel de juego, o cualquier solicitud especial..."
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
                    <p className="font-semibold text-gray-900">Política de cancelación</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cancelación gratuita hasta 24 horas antes de tu reserva. 
                      Si cancelas dentro de las 24 horas, se aplicará un cargo del 50%.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Reglas importantes</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1 ml-4">
                      <li>• Llega 10 minutos antes del horario reservado</li>
                      <li>• Uso de calzado deportivo obligatorio</li>
                      <li>• Respeta los horarios de inicio y fin</li>
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
                  <span className="text-xs text-gray-600">({bookingDetails.reviews} reseñas)</span>
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
                    <p className="font-semibold text-sm">{bookingDetails.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Participantes</p>
                    <p className="font-semibold text-sm">{bookingDetails.participants} personas</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <h4 className="font-bold text-gray-900">Información del precio</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Costo por hora</span>
                  <span className="font-semibold">Bs {bookingDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tarifa de servicio</span>
                  <span className="font-semibold">Bs {(bookingDetails.price * 0.1).toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">Total (Bs)</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  Bs {(bookingDetails.price * 1.1).toFixed(2)}
                </span>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-xs text-green-800">
                  <span className="font-bold">Pago seguro</span> - Tu información está protegida
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
