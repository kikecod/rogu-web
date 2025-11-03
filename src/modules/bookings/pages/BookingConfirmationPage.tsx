import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  QrCode, CheckCircle, Download, Share2, Calendar, 
  Clock, Users, MapPin, AlertCircle, Home, Trophy,
  Star, Copy, Check
} from 'lucide-react';
import Footer from '@/components/Footer';

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

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state?.bookingDetails as BookingDetails;
  const paymentMethod = location.state?.paymentMethod as 'card' | 'qr';

  const [copied, setCopied] = useState(false);

  // Scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay información de confirmación</h2>
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

  // Generar código de reserva único
  const bookingCode = `ROGU-${Date.now().toString().slice(-8)}`;
  
  // Calcular tiempo de validez (desde 30 minutos antes hasta el fin del horario)
  const [startTime] = bookingDetails.timeSlot.split(' - ');
  const validFrom = `30 minutos antes (${startTime})`;
  const validUntil = bookingDetails.timeSlot.split(' - ')[1];

  const handleDownloadQR = () => {
    // Simular descarga del QR
    alert('QR descargado exitosamente. En producción, esto generaría un archivo PNG.');
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Reserva ROGU',
          text: `Reserva confirmada: ${bookingDetails.fieldName}\nCódigo: ${bookingCode}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Tu navegador no soporta compartir. Puedes copiar el código o descargar el QR.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-extrabold mb-3">¡Reserva confirmada! 🎉</h1>
          <p className="text-xl text-green-50">
            Tu pago fue procesado exitosamente
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-blue-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <Trophy className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-bold">Código de acceso</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Presenta este QR en la entrada
            </h2>
            <p className="text-gray-600">
              Guarda o descarga este código para ingresar a tu cancha
            </p>
          </div>

          {/* QR Code Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6">
            <div className="bg-white p-6 rounded-xl inline-block mx-auto shadow-lg">
              <QrCode className="h-64 w-64 text-gray-800 mx-auto" />
            </div>
            
            {/* Booking Code */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="bg-white px-6 py-3 rounded-lg border-2 border-gray-300">
                <p className="text-sm text-gray-600 mb-1">Código de reserva</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{bookingCode}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copiar código"
              >
                {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Download className="h-5 w-5" />
              Descargar QR
            </button>
            <button
              onClick={handleShareQR}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
            >
              <Share2 className="h-5 w-5" />
              Compartir
            </button>
          </div>

          {/* Validity Info */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
            <div className="flex items-start gap-3 mb-3">
              <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Tiempo de validez</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">
                      <span className="font-semibold">Válido desde:</span> {validFrom}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">
                      <span className="font-semibold">Válido hasta:</span> {validUntil}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Válido para</h3>
                <p className="text-sm text-gray-700">
                  <span className="text-2xl font-extrabold text-amber-600">{bookingDetails.participants}</span> personas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            Detalles de tu reserva
          </h3>

          {/* Field Image and Info */}
          <div className="flex gap-4 mb-5 pb-5 border-b border-gray-200">
            <img
              src={bookingDetails.fieldImage}
              alt={bookingDetails.fieldName}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                {bookingDetails.fieldName}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{bookingDetails.sedeName}</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                <span className="font-bold text-sm">{bookingDetails.rating}</span>
                <span className="text-xs text-gray-600">({bookingDetails.reviews} reseñas)</span>
              </div>
            </div>
          </div>

          {/* Booking Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Fecha</p>
                <p className="font-bold text-gray-900">{bookingDetails.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Horario</p>
                <p className="font-bold text-gray-900">{bookingDetails.timeSlot}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Participantes</p>
                <p className="font-bold text-gray-900">{bookingDetails.participants} personas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Ubicación</p>
                <p className="font-bold text-gray-900 text-sm">{bookingDetails.address}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Costo de reserva</span>
              <span className="font-semibold">${bookingDetails.price.toFixed(2)} MXN</span>
            </div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-green-200">
              <span className="text-gray-700">Tarifa de servicio</span>
              <span className="font-semibold">${(bookingDetails.price * 0.1).toFixed(2)} MXN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total pagado</span>
              <span className="text-2xl font-extrabold text-green-600">
                ${(bookingDetails.price * 1.1).toFixed(2)} MXN
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Pago confirmado vía {paymentMethod === 'card' ? 'Tarjeta' : 'QR'}
            </p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-purple-600" />
            Información importante
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Llega <span className="font-bold">30 minutos antes</span> para validar tu QR en recepción</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>El código QR es <span className="font-bold">único e intransferible</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Trae <span className="font-bold">identificación oficial</span> para verificar tu reserva</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Si necesitas cancelar, hazlo con <span className="font-bold">24 horas de anticipación</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Recibiste un correo de confirmación con todos los detalles</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Home className="h-5 w-5" />
            Volver al inicio
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all"
          >
            <Calendar className="h-5 w-5" />
            Ver mis reservas
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
