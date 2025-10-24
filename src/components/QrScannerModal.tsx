import { useState, useCallback } from 'react';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import { validateQr } from '../utils/helpers';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  idReserva: number;
  idPersonaOpe?: number | null;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  idReserva,
  idPersonaOpe,
}) => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = useCallback(
    async (scannedValue: string | null) => {
      if (!scannedValue || isProcessing) return;

      if (!idPersonaOpe) {
        setError('No se encontró el ID del operador (idPersonaOpe).');
        return;
      }

      setIsProcessing(true);
      setError(null);
      try {
        const validation = await validateQr(idReserva, scannedValue, idPersonaOpe);
        setResult(validation?.resultado || 'QR validado correctamente.');
      } catch (err) {
        console.error('❌ Error validando QR:', err);
        setError('No se pudo validar el QR.');
      } finally {
        setIsProcessing(false);
      }
    },
    [idReserva, idPersonaOpe, isProcessing]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-semibold text-center mb-4">Escanear QR</h2>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <QrScanner
            onResult={handleScan}
            onError={(err) => {
              console.error('📸 Error de cámara:', err);
              setError('Error accediendo a la cámara.');
            }}
            constraints={{ facingMode: 'environment' }}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {result && (
          <p className="mt-4 text-green-600 text-center font-medium">
            ✅ {result}
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default QrScannerModal;
