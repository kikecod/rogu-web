const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PaseAcceso {
  idPaseAcceso: number;
  idReserva: number;
  codigoQR: string;  // Código UUID del QR
  estado: 'pendiente' | 'activo' | 'usado' | 'expirado';
  vecesUsado: number;
  usoMaximo: number;
  validoDesde: string;
  validoHasta: string;
  reserva?: {
    idReserva: number;
    iniciaEn: string;
    terminaEn: string;
    estado: string;
  };
}

/**
 * Obtener el pase de acceso por ID de reserva
 */
export const getPassByReserva = async (idReserva: number): Promise<PaseAcceso> => {
  console.log('🔍 [passesService] Fetching pass for reserva:', idReserva);
  console.log('🌐 [passesService] API Base URL:', API_BASE_URL);
  
  try {
    const url = `${API_BASE_URL}/api/pases-acceso/reserva/${idReserva}`;
    console.log('📍 [passesService] Full URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 [passesService] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [passesService] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ [passesService] Pass fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ [passesService] Error fetching pass:', error);
    throw error;
  }
};

/**
 * Obtener la URL del QR como imagen
 */
export const getQRImageUrl = (idPaseAcceso: number): string => {
  const url = `${API_BASE_URL}/api/pases-acceso/${idPaseAcceso}/qr`;
  console.log('🎨 [passesService] Generating QR image URL:', {
    idPaseAcceso,
    url,
    API_BASE_URL
  });
  return url;
};

/**
 * Descargar el QR con estilo (incluye logo ROGU)
 */
export const downloadQR = async (idPaseAcceso: number, codigoAcceso: string): Promise<void> => {
  console.log('⬇️ [passesService] Downloading styled QR:', {
    idPaseAcceso,
    codigoAcceso
  });
  
  try {
    const url = `${API_BASE_URL}/api/pases-acceso/${idPaseAcceso}/qr?styled=true`;
    console.log('🔗 [passesService] Download URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ [passesService] Download failed:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Error al descargar QR: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('📦 [passesService] Blob received:', {
      size: blob.size,
      type: blob.type
    });
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `QR-ROGU-${codigoAcceso}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
    console.log('✅ [passesService] QR downloaded successfully');
  } catch (error) {
    console.error('❌ [passesService] Error downloading QR:', error);
    throw error;
  }
};

/**
 * Compartir el QR
 */
export const shareQR = async (codigoAcceso: string, fieldName: string): Promise<void> => {
  console.log('📤 [passesService] Attempting to share QR:', {
    codigoAcceso,
    fieldName,
    shareSupported: !!navigator.share
  });
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Mi Reserva ROGU',
        text: `Reserva confirmada: ${fieldName}\nCódigo: ${codigoAcceso}`,
        url: window.location.href,
      });
      console.log('✅ [passesService] QR shared successfully');
    } catch (error) {
      console.error('❌ [passesService] Error sharing:', error);
      throw error;
    }
  } else {
    console.warn('⚠️ [passesService] Share API not supported');
    throw new Error('Tu navegador no soporta compartir. Puedes copiar el código o descargar el QR.');
  }
};
