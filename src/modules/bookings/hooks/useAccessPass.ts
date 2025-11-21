import { useState, useEffect } from 'react';
import { getPassByReserva, getQRImageUrl, downloadQR, shareQR, type PaseAcceso } from '../services/passesService';

interface UseAccessPassReturn {
  pass: PaseAcceso | null;
  loading: boolean;
  error: string | null;
  qrImageUrl: string | null;
  downloadQR: () => Promise<void>;
  shareQR: (fieldName: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAccessPass = (idReserva: number | null): UseAccessPassReturn => {
  const [pass, setPass] = useState<PaseAcceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  console.log('🔧 [useAccessPass] Hook initialized with idReserva:', idReserva);

  const fetchPass = async () => {
    if (!idReserva) {
      console.log('⚠️ [useAccessPass] No idReserva provided, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('🚀 [useAccessPass] Fetching pass for reserva:', idReserva);
    setLoading(true);
    setError(null);

    try {
      const passData = await getPassByReserva(idReserva);
      console.log('✅ [useAccessPass] Pass data received:', passData);
      
      setPass(passData);
      
      // Cargar la imagen QR (ahora es async)
      const imageUrl = await getQRImageUrl(passData.idPaseAcceso);
      console.log('🖼️ [useAccessPass] QR Image Data URL loaded');
      setQrImageUrl(imageUrl);
      
      setError(null);
    } catch (err) {
      console.error('❌ [useAccessPass] Error fetching pass:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el pase de acceso';
      setError(errorMessage);
      setPass(null);
      setQrImageUrl(null);
    } finally {
      setLoading(false);
      console.log('🏁 [useAccessPass] Fetch complete');
    }
  };

  useEffect(() => {
    fetchPass();
  }, [idReserva]);

  const handleDownloadQR = async () => {
    if (!pass) {
      console.warn('⚠️ [useAccessPass] No pass available for download');
      throw new Error('No hay pase de acceso disponible');
    }

    console.log('⬇️ [useAccessPass] Initiating QR download');
    await downloadQR(pass.idPaseAcceso, pass.codigoQR);
  };

  const handleShareQR = async (fieldName: string) => {
    if (!pass) {
      console.warn('⚠️ [useAccessPass] No pass available for sharing');
      throw new Error('No hay pase de acceso disponible');
    }

    console.log('📤 [useAccessPass] Initiating QR share');
    await shareQR(pass.codigoQR, fieldName);
  };

  return {
    pass,
    loading,
    error,
    qrImageUrl,
    downloadQR: handleDownloadQR,
    shareQR: handleShareQR,
    refetch: fetchPass,
  };
};
