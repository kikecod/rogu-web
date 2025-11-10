import React, { useState, useEffect } from 'react';
import { Filter, X, Star, DollarSign, MapPin, Users, Zap } from 'lucide-react';
import type { SearchFiltersParams, SearchFiltersInfo } from '../types';

interface IntegratedFiltersProps {
  onFiltersChange: (filters: Partial<SearchFiltersParams>) => void;
  availableFilters?: SearchFiltersInfo | null;
  currentFilters?: Partial<SearchFiltersParams>;
  className?: string;
}

const IntegratedFilters: React.FC<IntegratedFiltersProps> = ({
  onFiltersChange,
  availableFilters,
  currentFilters = {},
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Partial<SearchFiltersParams>>({
    precioMin: currentFilters.precioMin || undefined,
    precioMax: currentFilters.precioMax || undefined,
    ratingMin: currentFilters.ratingMin || undefined,
    cubierta: currentFilters.cubierta || undefined,
    superficie: currentFilters.superficie || '',
    iluminacion: currentFilters.iluminacion || undefined,
    aforoMin: currentFilters.aforoMin || undefined,
    aforoMax: currentFilters.aforoMax || undefined
  });

  // Sincronizar con filtros externos
  useEffect(() => {
    setLocalFilters({
      precioMin: currentFilters.precioMin || undefined,
      precioMax: currentFilters.precioMax || undefined,
      ratingMin: currentFilters.ratingMin || undefined,
      cubierta: currentFilters.cubierta || undefined,
      superficie: currentFilters.superficie || '',
      iluminacion: currentFilters.iluminacion || undefined,
      aforoMin: currentFilters.aforoMin || undefined,
      aforoMax: currentFilters.aforoMax || undefined
    });
  }, [currentFilters]);

  // Aplicar filtros
  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    
    onFiltersChange(cleanFilters);
    setIsOpen(false);
  };

  // Limpiar filtros
  const clearFilters = () => {
    const clearedFilters: Partial<SearchFiltersParams> = {
      precioMin: undefined,
      precioMax: undefined,
      ratingMin: undefined,
      cubierta: undefined,
      superficie: '',
      iluminacion: undefined,
      aforoMin: undefined,
      aforoMax: undefined
    };
    
    setLocalFilters(clearedFilters);
    onFiltersChange({});
  };

  // Actualizar filtro específico
  const updateFilter = <K extends keyof SearchFiltersParams>(
    key: K, 
    value: SearchFiltersParams[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  // Opciones de superficie basadas en datos disponibles
  const superficieOptions = [
    'Césped natural',
    'Césped sintético',
    'Concreto',
    'Madera',
    'Asfalto',
    'Arena',
    'Tierra'
  ];

  // Rangos de precio dinámicos o predeterminados
  const priceRange = availableFilters?.priceRange || { min: 0, max: 500 };

  return (
    <div className={`relative ${className}`}>
      {/* BOTÓN PARA ABRIR FILTROS */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
          ${activeFiltersCount > 0 
            ? 'bg-blue-50 text-blue-700 border-blue-300' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
          }
          transition-colors duration-200
        `}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* PANEL DE FILTROS */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-6 min-w-[400px]">
          <div className="space-y-6">
            
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Filtros avanzados</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RANGO DE PRECIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Rango de precio (Bs/hora)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localFilters.precioMin || ''}
                    onChange={(e) => updateFilter('precioMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={`${priceRange.min}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localFilters.precioMax || ''}
                    onChange={(e) => updateFilter('precioMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={`${priceRange.max}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Rango disponible: Bs{priceRange.min} - Bs{priceRange.max}
              </div>
            </div>

            {/* RATING MÍNIMO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Star className="w-4 h-4 inline mr-1" />
                Calificación mínima
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateFilter('ratingMin', 
                      localFilters.ratingMin === rating ? undefined : rating
                    )}
                    className={`
                      flex items-center px-3 py-2 border rounded-md text-sm
                      ${localFilters.ratingMin === rating
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Star className={`w-4 h-4 mr-1 ${
                      localFilters.ratingMin === rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                    }`} />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {/* CARACTERÍSTICAS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-1" />
                Características
              </label>
              <div className="space-y-3">
                
                {/* CUBIERTA */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.cubierta === true}
                    onChange={(e) => updateFilter('cubierta', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cancha cubierta</span>
                </label>

                {/* ILUMINACIÓN */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.iluminacion === true}
                    onChange={(e) => updateFilter('iluminacion', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Con iluminación
                  </span>
                </label>
              </div>
            </div>

            {/* SUPERFICIE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de superficie
              </label>
              <select
                value={localFilters.superficie || ''}
                onChange={(e) => updateFilter('superficie', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Cualquier superficie</option>
                {superficieOptions.map((superficie) => (
                  <option key={superficie} value={superficie}>
                    {superficie}
                  </option>
                ))}
              </select>
            </div>

            {/* CAPACIDAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Capacidad (número de personas)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={localFilters.aforoMin || ''}
                    onChange={(e) => updateFilter('aforoMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={localFilters.aforoMax || ''}
                    onChange={(e) => updateFilter('aforoMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* DISCIPLINAS DISPONIBLES */}
            {availableFilters?.availableDisciplines && availableFilters.availableDisciplines.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Deportes disponibles en esta búsqueda
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.availableDisciplines.slice(0, 6).map((disciplina) => (
                    <span
                      key={disciplina.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {disciplina.nombre}
                    </span>
                  ))}
                  {availableFilters.availableDisciplines.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{availableFilters.availableDisciplines.length - 6} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
              
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedFilters;