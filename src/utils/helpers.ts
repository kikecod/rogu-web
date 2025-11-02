// Utility functions for the ROGU app
import axios from 'axios';


// Import real sport field images
import futbolImg from '../assets/futbol.jpg';
import basquetbolImg from '../assets/basquetbol.jpeg';
import tenisImg from '../assets/tenis.jpg';
import voleibolImg from '../assets/voleibol.png';
import padelImg from '../assets/padel.jpeg';
import hockeyImg from '../assets/hockey.webp';
import type {
  ApiCancha,
  ApiCanchaDetalle,
  ApiReserva,
  ApiResena,
  ApiFoto,
  SportField,
  SportType,
  TimeSlot,
  Review,
  CreateReservaRequest,
  CreateReservaResponse
} from '../types';
import { getApiUrl, getImageUrl } from '../config/api';

export const generatePlaceholderImage = (width: number, height: number, text?: string) => {
  const baseUrl = 'https://via.placeholder.com';
  const textParam = text ? `?text=${encodeURIComponent(text)}` : '';
  return `${baseUrl}/${width}x${height}/22c55e/ffffff${textParam}`;
};

export const getSportFieldImages = (sport: string): string[] => {
  const sportImages: { [key: string]: string[] } = {
    football: [
      futbolImg,
      futbolImg, // Using same image twice for now, you can add more variants later
    ],
    basketball: [
      basquetbolImg,
      basquetbolImg,
    ],
    tennis: [
      tenisImg,
      tenisImg,
    ],
    volleyball: [
      voleibolImg,
      voleibolImg,
    ],
    paddle: [
      padelImg,
      padelImg,
    ],
    hockey: [
      hockeyImg,
      hockeyImg,
    ],
  };

  return sportImages[sport] || [generatePlaceholderImage(600, 400, 'Espacio Deportivo')];
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const generateAvatarUrl = (name: string): string => {
  return generatePlaceholderImage(100, 100, name.charAt(0).toUpperCase());
};

// Mapear superficie a tipo de deporte
const mapSuperficieToSport = (superficie: string): SportType => {
  const superficieMap: { [key: string]: SportType } = {
    'parquet': 'basketball',
    'césped': 'football',
    'césped sintético': 'football',
    'tierra batida': 'tennis',
    'polvo de ladrillo': 'tennis',
    'arena': 'volleyball',
    'paddle': 'paddle',
    'hielo': 'hockey',
  };

  const superficieLower = superficie.toLowerCase();
  for (const [key, value] of Object.entries(superficieMap)) {
    if (superficieLower.includes(key)) {
      return value;
    }
  }
  return 'football'; // default
};

// Mapear superficie a amenidades
const mapSuperficieToAmenities = (cancha: ApiCancha): string[] => {
  const amenities: string[] = [];
  
  if (cancha.cubierta) {
    amenities.push('Techado');
  }
  
  if (cancha.iluminacion && cancha.iluminacion !== 'No disponible') {
    amenities.push('Iluminación');
  }
  
  // Agregar amenidades basadas en la superficie
  amenities.push(`Superficie: ${cancha.superficie}`);
  
  // Agregar capacidad
  if (cancha.aforoMax > 0) {
    amenities.push(`Capacidad: ${cancha.aforoMax}`);
  }
  
  return amenities;
};

// Convertir ApiCancha a SportField
export const convertApiCanchaToSportField = (apiCancha: ApiCancha): SportField => {
  // Obtener URLs de las fotos o usar imágenes por defecto
  const images = apiCancha.fotos && apiCancha.fotos.length > 0
    ? apiCancha.fotos.map(foto => {
        const imageUrl = getImageUrl(foto.urlFoto);
        console.log('🖼️ Foto URL:', foto.urlFoto, '→', imageUrl);
        return imageUrl;
      })
    : getSportFieldImages(mapSuperficieToSport(apiCancha.superficie));

  // Determinar el tipo de deporte basado en la superficie
  const sport = mapSuperficieToSport(apiCancha.superficie);

  // Convertir precio de string a número
  const price = parseFloat(apiCancha.precio) || 0;

  return {
    id: apiCancha.idCancha.toString(),
    sedeId: apiCancha.id_Sede.toString(),
    name: apiCancha.nombre,
    description: apiCancha.reglasUso || 'Cancha deportiva disponible para reservas',
    images,
    price,
    sport,
    amenities: mapSuperficieToAmenities(apiCancha),
    availability: [],
    rating: 4.5, // Por defecto, ya que la API no devuelve rating
    reviews: 0, // Por defecto, ya que la API no devuelve reviews
    location: {
      address: apiCancha.dimensiones || '',
      city: 'Sede ' + apiCancha.id_Sede,
      coordinates: { lat: 0, lng: 0 }
    },
    owner: {
      id: apiCancha.id_Sede.toString(),
      name: 'Sede ' + apiCancha.id_Sede,
      avatar: generateAvatarUrl('Sede ' + apiCancha.id_Sede)
    }
  };
};

// Obtener todas las canchas desde la API
export const fetchCanchas = async (): Promise<SportField[]> => {
  try {
    const response = await fetch(getApiUrl('/cancha'));
    
    if (!response.ok) {
      throw new Error(`Error al obtener canchas: ${response.statusText}`);
    }
    
    const data: ApiCancha[] = await response.json();
    
    // Filtrar solo canchas disponibles
    const canchasDisponibles = data.filter(cancha => 
      cancha.estado.toLowerCase() === 'disponible' && !cancha.eliminadoEn
    );
    
    return canchasDisponibles.map(convertApiCanchaToSportField);
  } catch (error) {
    console.error('Error fetching canchas:', error);
    return [];
  }
};

// Obtener una cancha específica por ID con toda la información
export const fetchCanchaById = async (id: string): Promise<SportField> => {
  try {
    console.log(`🔍 Fetching cancha with ID: ${id}`);
    
    // 1. Obtener información de la cancha
    const canchaResponse = await fetch(getApiUrl(`/cancha/${id}`));
    if (!canchaResponse.ok) {
      throw new Error(`Error al obtener cancha: ${canchaResponse.statusText}`);
    }
    const canchaData: ApiCanchaDetalle = await canchaResponse.json();
    console.log('✅ Cancha obtenida:', canchaData);

    // 2. Obtener reservas de la cancha
    let reservasData: ApiReserva[] = [];
    try {
      const reservasResponse = await fetch(getApiUrl(`/reservas/cancha/${id}`));
      if (reservasResponse.ok) {
        reservasData = await reservasResponse.json();
        console.log('✅ Reservas obtenidas:', reservasData);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener reservas:', error);
    }

    // 3. Obtener reseñas de la cancha
    let resenasData: ApiResena[] = [];
    try {
      const resenasResponse = await fetch(getApiUrl(`/califica-cancha/cancha/${id}`));
      if (resenasResponse.ok) {
        resenasData = await resenasResponse.json();
        console.log('✅ Reseñas obtenidas:', resenasData);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener reseñas:', error);
    }

    // Convertir los datos al formato SportField
    return convertApiCanchaDetalleToSportField(canchaData, reservasData, resenasData);
  } catch (error) {
    console.error('❌ Error al obtener cancha:', error);
    throw error;
  }
};

// Convertir ApiCanchaDetalle completo a SportField
export const convertApiCanchaDetalleToSportField = (
  cancha: ApiCanchaDetalle,
  reservas: ApiReserva[],
  resenas: ApiResena[]
): SportField => {
  // Determinar el tipo de deporte basado en la superficie
  const sport = mapSuperficieToSport(cancha.superficie);

  // Convertir fotos a URLs completas
  const images = cancha.fotos && cancha.fotos.length > 0
    ? cancha.fotos.map((foto: ApiFoto) => {
        const imageUrl = getImageUrl(foto.urlFoto);
        console.log('🖼️ Foto URL:', foto.urlFoto, '→', imageUrl);
        return imageUrl;
      })
    : getSportFieldImages(sport);

  // Construir amenidades
  const amenities: string[] = [];
  if (cancha.cubierta) amenities.push('Techado');
  if (cancha.iluminacion && cancha.iluminacion !== 'No disponible') {
    amenities.push(`Iluminación ${cancha.iluminacion}`);
  }
  amenities.push(`Superficie: ${cancha.superficie}`);
  amenities.push(`Capacidad: ${cancha.aforoMax} personas`);
  if (cancha.dimensiones) amenities.push(`Dimensiones: ${cancha.dimensiones}`);

  // Calcular rating promedio de las reseñas
  let rating = 4.5; // Default
  let reviewsCount = 0;
  if (resenas && resenas.length > 0) {
    const totalCalificacion = resenas.reduce((sum, resena) => sum + resena.calificacion, 0);
    rating = parseFloat((totalCalificacion / resenas.length).toFixed(1));
    reviewsCount = resenas.length;
  }

  // Generar horarios disponibles basados en horario de apertura/cierre y reservas
  const availability = generateAvailabilitySlots(
    cancha.sede.horarioApertura,
    cancha.sede.horarioCierre,
    reservas,
    parseFloat(cancha.precio)
  );

  // Convertir reseñas al formato Review
  const reviewsList: Review[] = resenas.map(resena => ({
    id: resena.idResena,
    user: {
      name: resena.usuario?.nombre || 'Usuario',
      avatar: resena.usuario?.avatar ? getImageUrl(resena.usuario.avatar) : generateAvatarUrl('Usuario')
    },
    rating: resena.calificacion,
    date: new Date(resena.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    comment: resena.comentario
  }));

  // Convertir precio de string a número
  const price = parseFloat(cancha.precio) || 0;

  return {
    id: cancha.idCancha.toString(),
    sedeId: cancha.id_Sede.toString(),
    name: cancha.nombre,
    description: cancha.sede.descripcion || cancha.reglasUso || 'Cancha deportiva disponible para reservas',
    images,
    price,
    sport,
    amenities,
    availability,
    rating,
    reviews: reviewsCount,
    location: {
      address: cancha.sede.direccion,
      city: cancha.sede.ciudad !== 'N/A' ? cancha.sede.ciudad : '',
      coordinates: { lat: 0, lng: 0 }
    },
    owner: {
      id: cancha.id_Sede.toString(),
      name: cancha.sede.nombre,
      avatar: generateAvatarUrl(cancha.sede.nombre)
    },
    surface: cancha.superficie,
    size: cancha.dimensiones,
    indoor: cancha.cubierta,
    lighting: cancha.iluminacion,
    rules: cancha.reglasUso ? cancha.reglasUso.split(',').map((r: string) => r.trim()) : [],
    capacity: cancha.aforoMax,
    openingHours: {
      open: cancha.sede.horarioApertura,
      close: cancha.sede.horarioCierre
    },
    reviewsList
  };
};

// Generar slots de disponibilidad por hora basado en horario y reservas
const generateAvailabilitySlots = (
  horarioApertura: string,
  horarioCierre: string,
  reservas: ApiReserva[],
  precio: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  // Parsear horas de apertura y cierre
  const [openHour] = horarioApertura.split(':').map(Number);
  const [closeHour] = horarioCierre.split(':').map(Number);
  
  // Generar slots de 1 hora
  for (let hour = openHour; hour < closeHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Verificar si este horario está reservado
    const isReserved = reservas.some(reserva => {
      // Solo considerar reservadas si están Confirmadas o Pendientes
      if (reserva.estado === 'Cancelada') return false;
      
      const reservaStart = reserva.horaInicio.substring(0, 5);
      const reservaEnd = reserva.horaFin.substring(0, 5);
      
      return startTime >= reservaStart && startTime < reservaEnd;
    });
    
    slots.push({
      date: today.toISOString().split('T')[0],
      startTime,
      endTime,
      available: !isReserved,
      price: precio
    });
  }
  
  return slots;
};

// ==========================================
// FUNCIONES PARA RESERVAS
// ==========================================

/**
 * Crea una nueva reserva en el backend
 * @param reservaData - Datos de la reserva
 * @returns Promise con la respuesta del servidor
 */
export const createReserva = async (
  reservaData: CreateReservaRequest
): Promise<CreateReservaResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Debes iniciar sesión para hacer una reserva');
    }

    console.log('📝 Creando reserva:', reservaData);

    const response = await fetch(`${getApiUrl('/reservas')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reservaData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data: CreateReservaResponse = await response.json();
    console.log('✅ Reserva creada exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    throw error;
  }
};

// ==========================================
// FUNCIONES PARA CONTROLADOR DASHBOARD
// ==========================================

/**
 * Obtiene todas las reservas de una sede específica
 * @param idSede - ID de la sede
 */
export const fetchReservasBySede = async (idSede: string): Promise<ApiReserva[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`/reservas?sedeId=${idSede}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al obtener las reservas');

    const data: ApiReserva[] = await response.json();
    console.log('✅ Reservas por sede obtenidas:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener reservas por sede:', error);
    return [];
  }
};

/**
 * Obtiene los participantes de una reserva
 * @param idReserva - ID de la reserva
 */
export const fetchParticipantesByReserva = async (idReserva: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`/reservas/${idReserva}/participantes`), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al obtener los participantes');
    const data = await response.json();
    console.log(`👥 Participantes de reserva ${idReserva}:`, data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener participantes:', error);
    return [];
  }
};

// ==========================================
// FUNCIONES PARA DENUNCIAS
// ==========================================

export interface CreateDenunciaRequest {
  // idCliente (reportante) - puede venir como reporterId (legacy) o idCliente
  reporterId?: string;
  idCliente?: string;

  // idCancha y idSede son requeridos por el backend DTO
  idCancha?: string;
  idSede?: string;

  // persona denunciada (opcional en backend actual)
  reportedId?: string;

  categoria: string;
  gravedad: string;
  titulo: string;
  descripcion?: string;
}

/**
 * Envía una denuncia al backend
 */
// Helper: verifica si un cliente (idCliente) tiene al menos una reserva previa
// en la cancha especificada (idCancha). Se considera válida si existe una
// reserva con idCancha igual y cuya fecha/terminaEn esté en el pasado
export const clientHasVisitedCancha = async (idCliente: string, idCancha: string): Promise<boolean> => {
  try {
    if (!idCliente || !idCancha) return false;
    const token = localStorage.getItem('token');

    // Intentar obtener el historial de reservas del usuario
    const resp = await fetch(getApiUrl(`/reservas/usuario/${idCliente}`), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });

    if (!resp.ok) {
      console.warn('No se pudo obtener historial de reservas del cliente');
      return false;
    }

    const reservas = await resp.json();
    const now = new Date();

    // Buscar alguna reserva donde coincida la cancha y ya haya terminado
    const hasVisited = reservas.some((r: any) => {
      const reservaCanchaId = r.idCancha || r.id_cancha || r.id_canha || r.idCancha;
      if (!reservaCanchaId) return false;
      if (parseInt(String(reservaCanchaId), 10) !== parseInt(idCancha, 10)) return false;

      // Si existe 'terminaEn' ó 'termina_en' o 'fecha' + 'horaFin'
      const termina = r.terminaEn || r.termina_en || r.termina || null;
      if (termina) {
        const terminaDate = new Date(termina);
        if (!isNaN(terminaDate.getTime()) && terminaDate < now) return true;
      }

      // fallback: si existe 'fecha' y 'horaFin', construir fecha
      if (r.fecha && r.horaFin) {
        const dt = new Date(`${r.fecha}T${r.horaFin}`);
        if (!isNaN(dt.getTime()) && dt < now) return true;
      }

      // si estado indica asistido/confirmado y la fecha es anterior
      if (r.estado && (r.estado.toLowerCase() === 'confirmada' || r.estado.toLowerCase() === 'asistida')) {
        const inicia = r.iniciaEn || r.inicia_en || null;
        if (inicia) {
          const iniciaDate = new Date(inicia);
          if (!isNaN(iniciaDate.getTime()) && iniciaDate < now) return true;
        }
      }

      return false;
    });

    return !!hasVisited;
  } catch (err) {
    console.error('Error verificando historial de reservas:', err);
    return false;
  }
};


export const createDenuncia = async (denunciaData: CreateDenunciaRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');

    // Normalizar identificador de cliente (reportante)
    const idCliente = denunciaData.idCliente || denunciaData.reporterId;
    const idCancha = denunciaData.idCancha;
    const idSede = denunciaData.idSede;

    if (!idCliente) throw new Error('Falta id del cliente (reportante)');
    if (!idCancha || !idSede) throw new Error('Falta idCancha o idSede en la denuncia');

    // Validar que el cliente efectivamente estuvo en la cancha
    const visited = await clientHasVisitedCancha(String(idCliente), String(idCancha));
    if (!visited) {
      throw new Error('Solo se pueden denunciar canchas en las que el cliente haya tenido una reserva previa');
    }

    // Construir payload acorde al DTO del backend
    const payload = {
      idCliente: parseInt(String(idCliente), 10),
      idCancha: parseInt(String(idCancha), 10),
      idSede: parseInt(String(idSede), 10),
      categoria: denunciaData.categoria,
      gravedad: denunciaData.gravedad,
      titulo: denunciaData.titulo,
      descripcion: denunciaData.descripcion || ''
    };

    // Nota: el controlador del backend expone la ruta '/denuncia'
    const response = await fetch(getApiUrl('/denuncia'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Error al enviar denuncia');
    }

    console.log('✅ Denuncia enviada:', payload);
    return true;
  } catch (error) {
    console.error('❌ Error al crear denuncia:', error);
    return false;
  }
};

// ==========================================
// FUNCIONES PARA CALIFICACIONES DE CANCHAS
// ==========================================

export interface CreateCalificacionRequest {
  idCliente: string;
  idCancha: string;
  puntaje: number;
  dimensiones?: string;
  comentario?: string;
}

/**
 * Envía una calificación de cancha
 */
export const createCalificacion = async (calificacionData: CreateCalificacionRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');

    // Validar que cliente estuvo en la cancha
    const visited = await clientHasVisitedCancha(String(calificacionData.idCliente), String(calificacionData.idCancha));
    if (!visited) {
      throw new Error('Solo se pueden calificar canchas en las que el cliente haya tenido una reserva previa');
    }

    // El backend expone el recurso bajo '/califica-cancha'
    // Asegurarse de incluir idSede si es que no viene en el objeto
    let payload: any = { ...calificacionData };
    if (!payload.idSede) {
      try {
        const canchaResp = await fetch(getApiUrl(`/cancha/${calificacionData.idCancha}`));
        if (canchaResp.ok) {
          const canchaJson = await canchaResp.json();
          // intentar leer id de sede desde el objeto cancha
          payload.idSede = canchaJson.id_Sede || canchaJson.sede?.idSede || canchaJson.sede?.id_Sede || canchaJson.idSede;
        }
      } catch (err) {
        console.warn('No se pudo obtener idSede desde la cancha:', err);
      }
    }

    const response = await fetch(getApiUrl('/califica-cancha'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Error al enviar calificación');
    }

    console.log('⭐ Calificación enviada:', calificacionData);
    return true;
  } catch (error) {
    console.error('❌ Error al crear calificación:', error);
    return false;
  }
};

/**
 * Valida un QR escaneado contra el backend.
 * @param idReserva ID de la reserva actual.
 * @param qrData Texto escaneado del QR.
 * @param idPersonaOpe ID del operador/controlador.
 * @returns Objeto con resultado del backend.
 */
export const validateQr = async (idReserva: number, qrData: string, idPersonaOpe: number) => {
  try {
    const response = await axios.post('/api/qr/validate', {
      idReserva,
      qrData,
      idPersonaOpe,
    });

    // Se asume que el backend responde con { resultado: "mensaje" }
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al validar QR:', error);
    throw new Error(error.response?.data?.message || 'Error validando QR');
  }
};

