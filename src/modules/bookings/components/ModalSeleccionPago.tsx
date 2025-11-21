import React from 'react';
import { X, CreditCard, QrCode } from 'lucide-react';
import type { MetodoPago } from '../types/libelula.types';

interface ModalSeleccionPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMetodo: (metodo: MetodoPago) => void;
  loading?: boolean;
}

const ModalSeleccionPago: React.FC<ModalSeleccionPagoProps> = ({
  isOpen,
  onClose,
  onSelectMetodo,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white">Selecciona método de pago</h2>
          <p className="text-blue-100 mt-1">Elige cómo quieres realizar el pago</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Opción: Tarjeta de crédito/débito */}
          <button
            onClick={() => onSelectMetodo('tarjeta')}
            disabled={loading}
            className="w-full group relative overflow-hidden"
          >
            <div className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {/* Icono */}
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              
              {/* Texto */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Tarjeta de crédito/débito
                </h3>
                <p className="text-sm text-gray-600">
                  Pago seguro con tarjeta
                </p>
              </div>

              {/* Badge */}
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Seguro
              </div>
            </div>
          </button>

          {/* Opción: QR Simple */}
          <button
            onClick={() => onSelectMetodo('qr')}
            disabled={loading}
            className="w-full group relative overflow-hidden"
          >
            <div className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {/* Icono */}
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              
              {/* Texto */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Código QR
                </h3>
                <p className="text-sm text-gray-600">
                  Escanea y paga con tu app
                </p>
              </div>

              {/* Badge */}
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Rápido
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Todos los pagos son procesados de forma segura por Libélula
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionPago;
