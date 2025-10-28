import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Footer from '../../../../../shared/components/layout/Footer';
import { ROUTE_PATHS } from '../../../../../constants';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reservaId = (location.state as { reservaId?: number })?.reservaId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-green-100">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-6">
            Pago en proceso de confirmacion
          </h1>
          <p className="text-gray-600 mt-4">
            Recibimos la notificacion de pago de Libelula. La reserva se confirmara automaticamente
            en cuanto la pasarela marque el pago como completado.
          </p>
          {reservaId ? (
            <p className="mt-4 text-sm text-gray-500">
              Identificador de reserva: <span className="font-semibold">{reservaId}</span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => navigate(ROUTE_PATHS.BOOKINGS)}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver mis reservas
            </button>
            <button
              onClick={() => navigate(ROUTE_PATHS.HOME)}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutSuccessPage;
