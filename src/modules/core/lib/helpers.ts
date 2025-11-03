// Utility functions for the ROGU app

// Import real sport field images
import futbolImg from '@/assets/futbol.jpg';
import basquetbolImg from '@/assets/basquetbol.jpeg';
import tenisImg from '@/assets/tenis.jpg';
import voleibolImg from '@/assets/voleibol.png';
import padelImg from '@/assets/padel.jpeg';
import hockeyImg from '@/assets/hockey.webp';
import type { 
  ApiCancha, 
  ApiCanchaDetalle, 
  ApiReserva,
  ApiReservaUsuario,
  ApiResena, 
  ApiFoto,
  SportField, 
  SportType,
  TimeSlot,
  Review,
  CreateReservaRequest,
  CreateReservaResponse,
  UpdateReservaRequest,
  UpdateReservaResponse,
  CancelReservaRequest,
  CancelReservaResponse
} from '@/fields/types/field.types';
import { getApiUrl, getImageUrl } from '../config/api';

export const generatePlaceholderImage = (width: number, height: number, text?: string) => {
  const baseUrl = 'https://placehold.co';
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
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
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
export const mapSuperficieToSport = (superficie: string): SportType => {
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
        const resenasResult = await resenasResponse.json();
        // El endpoint devuelve un objeto con { resenas: [], ratingPromedio, etc. }
        // Extraemos solo el array de reseñas
        resenasData = resenasResult.resenas || [];
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

// Obtener reservas de una cancha filtradas por fecha específica
export const fetchReservasByFecha = async (canchaId: string, fecha: Date): Promise<ApiReserva[]> => {
  try {
    // Formatear fecha a YYYY-MM-DD
    const fechaStr = fecha.toISOString().split('T')[0];
    console.log(`🔍 Fetching reservas for cancha ${canchaId} on ${fechaStr}`);
    
    const response = await fetch(getApiUrl(`/reservas/cancha/${canchaId}?fecha=${fechaStr}`));
    
    if (!response.ok) {
      throw new Error(`Error al obtener reservas: ${response.statusText}`);
    }
    
    const reservasData: ApiReserva[] = await response.json();
    console.log('✅ Reservas obtenidas para fecha:', reservasData);
    
    return reservasData;
  } catch (error) {
    console.error('❌ Error al obtener reservas por fecha:', error);
    return [];
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
  // Usar horarios de la cancha si existen, sino usar los de la sede como fallback
  const horaApertura = cancha.horaApertura || cancha.sede.horarioApertura || '06:00';
  const horaCierre = cancha.horaCierre || cancha.sede.horarioCierre || '23:00';
  
  const availability = generateAvailabilitySlots(
    horaApertura,
    horaCierre,
    reservas,
    parseFloat(cancha.precio)
  );

  // Convertir reseñas al formato Review
  const reviewsList: Review[] = Array.isArray(resenas) 
    ? resenas.map(resena => ({
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
      }))
    : [];

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
      open: cancha.horaApertura || cancha.sede.horarioApertura || '06:00',
      close: cancha.horaCierre || cancha.sede.horarioCierre || '23:00'
    },
    reviewsList
  };
};

// Generar slots de disponibilidad por hora basado en horario y reservas
export const generateAvailabilitySlots = (
  horarioApertura: string,
  horarioCierre: string,
  reservas: ApiReserva[],
  precio: number,
  fecha?: Date
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const targetDate = fecha || new Date();
  
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
      date: targetDate.toISOString().split('T')[0],
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
      
      // Mejorar el mensaje de error del backend si viene el nuevo formato
      if (errorData.detalles?.problema) {
        const horarioCancha = `${errorData.detalles.horarioCancha.apertura.substring(0, 5)} - ${errorData.detalles.horarioCancha.cierre.substring(0, 5)}`;
        throw new Error(
          `${errorData.error}\nHorario disponible: ${horarioCancha}`
        );
      }
      
      throw new Error(errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data: CreateReservaResponse = await response.json();
    console.log('✅ Reserva creada exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    throw error;
  }
};

/**
 * Obtiene la imagen principal de una cancha
 * @param canchaId - ID de la cancha
 * @returns Promise con la URL de la imagen o imagen por defecto
 */
export const fetchCanchaImage = async (canchaId: number): Promise<string> => {
  try {
    const response = await fetch(getApiUrl(`/cancha/${canchaId}`));
    
    if (!response.ok) {
      console.warn(`⚠️ No se pudo obtener imagen de cancha ${canchaId}`);
      return getSportFieldImages('football')[0];
    }
    
    const canchaData: ApiCanchaDetalle = await response.json();
    
    // Si tiene fotos, devolver la primera
    if (canchaData.fotos && canchaData.fotos.length > 0) {
      return getImageUrl(canchaData.fotos[0].urlFoto);
    }
    
    // Si no tiene fotos, usar imagen por defecto según la superficie
    const sport = mapSuperficieToSport(canchaData.superficie);
    return getSportFieldImages(sport)[0];
  } catch (error) {
    console.error(`❌ Error al obtener imagen de cancha ${canchaId}:`, error);
    return getSportFieldImages('football')[0];
  }
};

/**
 * Obtiene todas las reservas de un usuario
 * @param userId - ID del usuario
 * @returns Promise con la lista de reservas del usuario
 */
export const  fetchReservasByUserId = async (userId: number): Promise<ApiReservaUsuario[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Debes iniciar sesión para ver tus reservas');
    }

    console.log(`🔍 Obteniendo reservas del usuario ${userId}`);
    console.log('🔑 Token presente:', token ? 'Sí' : 'No');

    const response = await fetch(getApiUrl(`/reservas/usuario/${userId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Status de respuesta:', response.status);

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('📝 Detalle del error:', errorData);
      } catch (e) {
        console.error('❌ No se pudo parsear el error como JSON');
      }
      throw new Error(errorMessage);
    }

    const data: ApiReservaUsuario[] = await response.json();
    console.log('✅ Reservas obtenidas:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    throw error;
  }
};

/**
 * Actualiza una reserva existente
 * @param idReserva - ID de la reserva a modificar
 * @param reservaData - Nuevos datos de la reserva
 * @returns Promise con la respuesta del servidor
 */
export const updateReserva = async (
  idReserva: number,
  reservaData: UpdateReservaRequest
): Promise<UpdateReservaResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Debes iniciar sesión para modificar una reserva');
    }

    console.log(`✏️ Actualizando reserva ${idReserva}:`, reservaData);

    const response = await fetch(getApiUrl(`/reservas/${idReserva}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reservaData),
    });

    console.log('📡 Status de respuesta:', response.status);

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        
        // Mejorar el mensaje de error del backend si viene el nuevo formato
        if (errorData.detalles?.problema) {
          const horarioCancha = `${errorData.detalles.horarioCancha.apertura.substring(0, 5)} - ${errorData.detalles.horarioCancha.cierre.substring(0, 5)}`;
          throw new Error(
            `${errorData.error}\nHorario disponible: ${horarioCancha}`
          );
        }
        
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('📝 Detalle del error:', errorData);
      } catch (e) {
        if (e instanceof Error && e.message.includes('Horario disponible')) {
          throw e;
        }
        console.error('❌ No se pudo parsear el error como JSON');
      }
      throw new Error(errorMessage);
    }

    const data: UpdateReservaResponse = await response.json();
    console.log('✅ Reserva actualizada exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
    throw error;
  }
};

/**
 * Cancela una reserva existente
 * @param idReserva - ID de la reserva a cancelar
 * @param cancelData - Datos de cancelación (motivo y canal opcionales)
 * @returns Promise con la respuesta del servidor
 */
export const cancelReserva = async (
  idReserva: number,
  cancelData?: CancelReservaRequest
): Promise<CancelReservaResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Debes iniciar sesión para cancelar una reserva');
    }

    console.log(`🗑️ Cancelando reserva ${idReserva}`, cancelData);

    const response = await fetch(getApiUrl(`/reservas/${idReserva}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: cancelData ? JSON.stringify(cancelData) : undefined,
    });

    console.log('📡 Status de respuesta:', response.status);

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('📝 Detalle del error:', errorData);
        
        // Manejar errores específicos
        if (response.status === 404) {
          throw new Error('Reserva no encontrada');
        }
        if (response.status === 409) {
          throw new Error(errorData.error || 'La reserva ya está cancelada');
        }
      } catch (e) {
        if (e instanceof Error && (e.message === 'Reserva no encontrada' || e.message.includes('ya está cancelada'))) {
          throw e;
        }
        console.error('❌ No se pudo parsear el error como JSON');
      }
      throw new Error(errorMessage);
    }

    const data: CancelReservaResponse = await response.json();
    console.log('✅ Reserva cancelada exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al cancelar reserva:', error);
    throw error;
  }
};