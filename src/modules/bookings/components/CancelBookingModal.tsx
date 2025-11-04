import React, { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { cancelReserva } from '@/core/lib/helpers';
import type { CancelReservaRequest } from '../types/booking.types';

interface CancelBookingModalProps {
  booking: {
    id: string;
    fieldName: string;
    date: string;
    timeSlot: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

// Motivos predefinidos de cancelación
const CANCEL_REASONS = [
  'Cambio de planes',
  'Condiciones climáticas adversas',
  'Emergencia personal',
  'Problema de salud',
  'Conflicto de horarios',
  'Otro motivo'
];

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ 
  booking, 
  onClose, 
  onSuccess 
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determinar el motivo final
      let finalReason = selectedReason;
      if (selectedReason === 'Otro motivo' && customReason.trim()) {
        finalReason = customReason.trim();
      } else if (selectedReason === 'Otro motivo' && !customReason.trim()) {
        setError('Por favor especifica el motivo de cancelación');
        setLoading(false);
        return;
      }

      // Preparar datos de cancelación
      const cancelData: CancelReservaRequest | undefined = finalReason 
        ? { motivo: finalReason, canal: 'WEB' }
        : undefined;

      // Cancelar la reserva
      await cancelReserva(parseInt(booking.id), cancelData);
      
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar la reserva';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cancelar Reserva</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la reserva */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{booking.fieldName}</h3>
            <p className="text-sm text-gray-600">
              📅 {booking.date}
            </p>
            <p className="text-sm text-gray-600">
              ⏰ {booking.timeSlot}
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">¿Estás seguro de cancelar esta reserva?</p>
              <p>Esta acción no se puede deshacer. Se te notificará sobre cualquier reembolso aplicable según las políticas de cancelación.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Motivos de cancelación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Motivo de cancelación (opcional)
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`
                    flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition
                    ${selectedReason === reason 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError(null);
                    }}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {/* Campo de texto personalizado */}
            {selectedReason === 'Otro motivo' && (
              <div className="mt-3">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Escribe tu motivo aquí..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {customReason.length}/200 caracteres
                </p>
              </div>
            )}

            {/* Opción sin motivo */}
            <label
              className={`
                flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition mt-2
                ${selectedReason === '' 
                  ? 'border-gray-400 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name="cancelReason"
                value=""
                checked={selectedReason === ''}
                onChange={() => {
                  setSelectedReason('');
                  setCustomReason('');
                  setError(null);
                }}
                className="w-4 h-4 text-gray-600 focus:ring-gray-500"
              />
              <span className="text-sm font-medium text-gray-600">Prefiero no especificar</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, mantener
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Sí, cancelar reserva'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
