import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, ShieldAlert, ArrowRight } from 'lucide-react';
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
      let finalReason = selectedReason;
      if (selectedReason === 'Otro motivo' && customReason.trim()) {
        finalReason = customReason.trim();
      } else if (selectedReason === 'Otro motivo' && !customReason.trim()) {
        setError('Por favor especifica el motivo de cancelación');
        setLoading(false);
        return;
      }

      const cancelData: CancelReservaRequest | undefined = finalReason
        ? { motivo: finalReason, canal: 'WEB' }
        : undefined;

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-8 py-6 border-b border-red-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Cancelar Reserva</h2>
              <p className="text-red-700 text-sm mt-1 font-medium">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors -mr-2 -mt-2"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">{booking.fieldName}</h3>
            <p className="text-sm text-gray-500">
              {booking.date} • {booking.timeSlot}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              ¿Por qué deseas cancelar? <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedReason === reason
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'
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
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className={`text-sm font-medium ${selectedReason === reason ? 'text-red-900' : 'text-gray-700'}`}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {selectedReason === 'Otro motivo' && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Cuéntanos más detalles..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all resize-none text-sm"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1 text-right font-medium">
                  {customReason.length}/200
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            No, mantener
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                Sí, cancelar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
