import React, { useEffect, useState } from 'react';
import { X, Download, Loader2, CheckCircle } from 'lucide-react';

interface ModalQRPagoProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  transaccionId: string;
}

const ModalQRPago: React.FC<ModalQRPagoProps> = ({
  isOpen,
  onClose,
  qrUrl,
  transaccionId
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-pago-${transaccionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white">Escanea el código QR</h2>
          <p className="text-green-100 mt-1">Usa tu aplicación de pagos favorita</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Code */}
          <div className="relative bg-white border-4 border-green-500 rounded-2xl p-6 mb-6 shadow-lg">
            {/* Loader mientras carga la imagen */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
              </div>
            )}
            
            {/* Imagen del QR */}
            <img
              src={qrUrl}
              alt="Código QR de pago"
              className={`w-full h-auto transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Error al cargar el QR');
                setImageLoaded(true);
              }}
            />

            {/* Corners decorativos */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-green-600 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-green-600 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-green-600 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-green-600 rounded-br-lg" />
          </div>

          {/* Instrucciones */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Pasos para pagar:</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Abre tu app de banco o billetera digital</li>
                  <li>Selecciona la opción "Escanear QR"</li>
                  <li>Apunta tu cámara al código QR</li>
                  <li>Confirma el pago en tu app</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Botón de descarga */}
          <button
            onClick={handleDownloadQR}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Descargar código QR
          </button>

          {/* Info adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ID de transacción: <span className="font-mono">{transaccionId.substring(0, 16)}...</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Importante:</strong> No cierres esta ventana hasta completar el pago. 
            Serás redirigido automáticamente una vez confirmado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalQRPago;
