import React, { useState } from 'react';
import { Star, MapPin, Clock, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAvailability } from '../hooks';
import type { Cancha, SearchResponse } from '../types';

interface SearchResultsProps {
  searchResponse: SearchResponse | null;
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  onSortChange?: (sortBy: 'precio' | 'rating' | 'nombre', sortOrder: 'asc' | 'desc') => void;
  onViewDetails?: (cancha: Cancha) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResponse,
  loading = false,
  error = null,
  onLoadMore,
  onSortChange,
  onViewDetails
}) => {
  const [sortBy, setSortBy] = useState<'precio' | 'rating' | 'nombre'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [checkingAvailability, setCheckingAvailability] = useState<Set<number>>(new Set());

  const availability = useAvailability();

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSortBy: 'precio' | 'rating' | 'nombre') => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  // Verificar disponibilidad rápida
  const checkQuickAvailability = async (cancha: Cancha) => {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    const startTime = `${currentHour + 1}:00`;
    const endTime = `${currentHour + 3}:00`;

    setCheckingAvailability(prev => new Set(prev).add(cancha.idCancha));

    try {
      await availability.checkAvailability({
        idCancha: cancha.idCancha,
        fecha: today,
        horaInicio: startTime,
        horaFin: endTime
      });
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
    } finally {
      setCheckingAvailability(prev => {
        const newSet = new Set(prev);
        newSet.delete(cancha.idCancha);
        return newSet;
      });
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Renderizar estrellas
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  // Estado de carga
  if (loading && !searchResponse) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Buscando canchas...</span>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error en la búsqueda</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Sin resultados
  if (!searchResponse || searchResponse.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron canchas</h3>
        <p className="text-gray-600 mb-4">
          Intenta ajustar tus criterios de búsqueda o buscar en otra ubicación.
        </p>
      </div>
    );
  }

  const { results, pagination } = searchResponse;

  return (
    <div className="space-y-6">
      {/* HEADER CON RESULTADOS Y ORDENAMIENTO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {pagination.total} canchas encontradas
          </h2>
          <p className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages}
          </p>
        </div>

        {/* ORDENAMIENTO */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <div className="flex gap-2">
            {[
              { key: 'rating', label: 'Calificación' },
              { key: 'precio', label: 'Precio' },
              { key: 'nombre', label: 'Nombre' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key as 'precio' | 'rating' | 'nombre')}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${sortBy === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {label}
                {sortBy === key && (
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA DE RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((cancha) => {
          const isCheckingThisCancha = checkingAvailability.has(cancha.idCancha);
          
          return (
            <div
              key={cancha.idCancha}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* IMAGEN */}
              <div className="relative h-48 bg-gray-200">
                {cancha.fotos && cancha.fotos.length > 0 ? (
                  <img
                    src={cancha.fotos[0].urlFoto}
                    alt={cancha.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* BADGE DE DISPONIBILIDAD */}
                {cancha.disponible !== undefined && (
                  <div className={`
                    absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
                    ${cancha.disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {cancha.disponible ? 'Disponible' : 'Ocupada'}
                  </div>
                )}
              </div>

              {/* CONTENIDO */}
              <div className="p-4">
                {/* TÍTULO Y RATING */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {cancha.nombre}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <div className="flex">
                      {renderStars(cancha.ratingPromedio)}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({cancha.totalResenas})
                    </span>
                  </div>
                </div>

                {/* SEDE Y UBICACIÓN */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {cancha.sede.nombre} - {cancha.sede.district}, {cancha.sede.city}
                  </span>
                </div>

                {/* DETALLES */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Hasta {cancha.aforoMax} personas</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{cancha.horaApertura.slice(0, 5)} - {cancha.horaCierre.slice(0, 5)}</span>
                  </div>
                </div>

                {/* CARACTERÍSTICAS */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {cancha.superficie && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {cancha.superficie}
                    </span>
                  )}
                  {cancha.cubierta && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Cubierta
                    </span>
                  )}
                  {cancha.disciplinas.slice(0, 2).map((disciplina) => (
                    <span key={disciplina.idDisciplina} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {disciplina.nombre}
                    </span>
                  ))}
                  {cancha.disciplinas.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{cancha.disciplinas.length - 2} más
                    </span>
                  )}
                </div>

                {/* PRECIO Y ACCIONES */}
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-gray-900">
                    {formatPrice(cancha.precio)}
                    <span className="text-sm font-normal text-gray-600">/hora</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* BOTÓN DE DISPONIBILIDAD RÁPIDA */}
                    <button
                      onClick={() => checkQuickAvailability(cancha)}
                      disabled={isCheckingThisCancha}
                      className={`
                        px-3 py-1 rounded-md text-xs font-medium transition-colors
                        ${isCheckingThisCancha
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }
                      `}
                    >
                      {isCheckingThisCancha ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                          Verificando...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Disponibilidad
                        </div>
                      )}
                    </button>

                    {/* BOTÓN VER DETALLES */}
                    <button
                      onClick={() => onViewDetails?.(cancha)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>

                {/* RESULTADO DE DISPONIBILIDAD */}
                {availability.availability && (
                  <div className={`
                    mt-2 p-2 rounded-md text-xs
                    ${availability.isAvailable 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }
                  `}>
                    <div className="flex items-center">
                      {availability.isAvailable ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      <span>
                        {availability.isAvailable 
                          ? 'Disponible para las próximas 2 horas'
                          : 'No disponible en el horario consultado'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          
          {pagination.hasNext && onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                ${loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  Cargando...
                </div>
              ) : (
                'Cargar más resultados'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;