import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, CreditCard, QrCode, Star, MapPin, 
  Calendar, Users, Clock, Shield, AlertCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import { createReserva } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import type { CreateReservaRequest } from '../types';

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
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay información de reserva</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const validateCardForm = () => {
    if (paymentMethod !== 'card') return true;
    return cardNumber.length === 16 && 
           expiryDate.length === 5 && 
           cvv.length === 3 && 
           cardName.trim().length > 0;
  };

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
    if (!user || !fieldId || !selectedDate || !selectedTimeSlots || selectedTimeSlots.length === 0) {
      alert('Faltan datos para completar la reserva');
      return;
    }

    // Validar que el usuario tenga el rol de CLIENTE
    if (!user.roles?.includes('CLIENTE')) {
      alert('Debes tener el rol de cliente para hacer reservas');
      return;
    }

    // Usar idPersona como idCliente (el backend lo asocia así)
    const idCliente = user.idPersona;

    if (!idCliente) {
      alert('No se encontró la información de persona del usuario');
      return;
    }

    setIsProcessing(true);

    try {
      // Construir datos de la reserva para cada slot seleccionado
      // Por ahora tomamos solo el primer slot (puedes mejorar esto para múltiples slots)
      const firstSlot = selectedTimeSlots[0]; // "09:00 - 10:00"
      const [startTime, endTime] = firstSlot.split(' - ');
      
      // Crear timestamps ISO
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      
      const iniciaEn = `${year}-${month}-${day}T${startTime}:00`;
      const terminaEn = `${year}-${month}-${day}T${endTime}:00`;

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

      console.log('📝 Enviando reserva:', reservaData);

      // Crear la reserva en el backend
      const response = await createReserva(reservaData);
      
      console.log('✅ Reserva creada exitosamente:', response);

      // Navegar a la página de confirmación con QR
      navigate('/booking-confirmation', {
        state: {
          bookingDetails,
          paymentMethod,
          reservaId: response.reserva.idReserva,
          reserva: response.reserva
        }
      });
    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la reserva. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setCardNumber(numbers.slice(0, 16));
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      setExpiryDate(`${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`);
    } else {
      setExpiryDate(numbers);
    }
  };

  const formatCVV = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setCvv(numbers.slice(0, 3));
  };

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
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de tarjeta *
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => formatCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          showErrors && cardNumber.length !== 16 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {showErrors && cardNumber.length !== 16 && (
                        <p className="text-xs text-red-500 mt-1">Ingresa un número de tarjeta válido (16 dígitos)</p>
                      )}
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de vencimiento *
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => formatExpiryDate(e.target.value)}
                          placeholder="MM/AA"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            showErrors && expiryDate.length !== 5 ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {showErrors && expiryDate.length !== 5 && (
                          <p className="text-xs text-red-500 mt-1">Formato: MM/AA</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => formatCVV(e.target.value)}
                          placeholder="123"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            showErrors && cvv.length !== 3 ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {showErrors && cvv.length !== 3 && (
                          <p className="text-xs text-red-500 mt-1">3 dígitos</p>
                        )}
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del titular *
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Como aparece en la tarjeta"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          showErrors && !cardName.trim() ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {showErrors && !cardName.trim() && (
                        <p className="text-xs text-red-500 mt-1">Ingresa el nombre del titular</p>
                      )}
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
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-fadeIn">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="h-48 w-48 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">
                          Escanea este código QR con tu app de banco
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          ${bookingDetails.price.toFixed(2)} MXN
                        </p>
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
                  <span className="font-semibold">${bookingDetails.price.toFixed(2)} MXN</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tarifa de servicio</span>
                  <span className="font-semibold">${(bookingDetails.price * 0.1).toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">Total (MXN)</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  ${(bookingDetails.price * 1.1).toFixed(2)}
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
