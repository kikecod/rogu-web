import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Dumbbell } from 'lucide-react';
import { useSearchFilters, useCityAutocomplete, useDistrictAutocomplete } from '../hooks';
import type { SearchFiltersParams } from '../types';

interface IntegratedSearchBarProps {
  onSearchResults?: (results: any) => void;
  className?: string;
  autoSearch?: boolean;
}

const SPORTS = [
  { value: '', label: 'Todos los deportes' },
  { value: 'Fútbol', label: '⚽ Fútbol' },
  { value: 'Fútbol 5', label: '⚽ Fútbol 5' },
  { value: 'Básquetbol', label: '🏀 Básquetbol' },
  { value: 'Tenis', label: '🎾 Tenis' },
  { value: 'Vóleibol', label: '🏐 Vóleibol' },
  { value: 'Pádel', label: '🎾 Pádel' },
];

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const IntegratedSearchBar: React.FC<IntegratedSearchBarProps> = ({
  onSearchResults,
  className = '',
  autoSearch = false
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  // State para los parámetros de búsqueda
  const [searchParams, setSearchParams] = useState<SearchFiltersParams>({
    country: 'Bolivia',
    stateProvince: 'La Paz',
    city: '',
    district: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    disciplina: '',
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  // Hooks
  const search = useSearchFilters({ autoSearch: false });
  const cityAutocomplete = useCityAutocomplete({
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 8
  });
  const districtAutocomplete = useDistrictAutocomplete({
    city: searchParams.city || '',
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 8
  });

  // Sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      if (searchBarRef.current) {
        const offset = searchBarRef.current.offsetTop;
        setIsSticky(window.scrollY > offset + 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(target)) {
        setShowTimePicker(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(target)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notificar cambios en resultados
  useEffect(() => {
    if (onSearchResults && search.results.length > 0) {
      onSearchResults({
        results: search.results,
        pagination: search.pagination,
        filters: search.filters
      });
    }
  }, [search.results, search.pagination, search.filters, onSearchResults]);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await search.smartSearch(searchParams);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  // Búsqueda automática cuando cambian parámetros clave
  useEffect(() => {
    if (autoSearch && (searchParams.city || searchParams.district || searchParams.disciplina)) {
      const timer = setTimeout(() => {
        search.smartSearch(searchParams);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams.city, searchParams.district, searchParams.disciplina, autoSearch, search]);

  // Funciones de manejo de eventos
  const handleDateSelect = (date: string) => {
    setSearchParams(prev => ({ ...prev, fecha: date }));
    setShowCalendar(false);
  };

  const handleTimeSelect = (time: string, type: 'inicio' | 'fin') => {
    if (type === 'inicio') {
      setSearchParams(prev => ({ ...prev, horaInicio: time }));
    } else {
      setSearchParams(prev => ({ ...prev, horaFin: time }));
    }
    setShowTimePicker(false);
  };

  const handleCitySelect = (city: string) => {
    setSearchParams(prev => ({
      ...prev,
      city,
      district: '' // Reset distrito al cambiar ciudad
    }));
    cityAutocomplete.clearSuggestions();
    setShowCityDropdown(false);
  };

  const handleDistrictSelect = (district: string) => {
    setSearchParams(prev => ({ ...prev, district }));
    districtAutocomplete.clearSuggestions();
    setShowDistrictDropdown(false);
  };

  // Funciones de formato
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      days.push({
        date: dateString,
        day: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        weekday: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        isToday: i === 0
      });
    }

    return days;
  };

  return (
    <div
      ref={searchBarRef}
      className={`
        w-full transition-all duration-300 z-50
        ${isSticky
          ? 'relative md:fixed md:top-0 md:left-0 md:right-0 md:bg-white md:shadow-lg md:border-b md:border-gray-200'
          : 'relative'
        }
        ${className}
      `}
    >
      {/* Mobile Search Button */}
      <div className="md:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => setShowMobileSearch(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">Buscar</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-[100] md:hidden overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Buscar canchas</h2>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Form */}
            <div className="p-4">
              <form onSubmit={(e) => { handleSubmit(e); setShowMobileSearch(false); }} className="space-y-4">
                {/* Ciudad */}
                <div className="relative" ref={cityDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="¿Dónde quieres jugar?"
                    value={searchParams.city || cityAutocomplete.query}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchParams(prev => ({ ...prev, city: value }));
                      cityAutocomplete.updateQuery(value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {showCityDropdown && (cityAutocomplete.hasSuggestions || cityAutocomplete.loading) && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {cityAutocomplete.loading && (
                        <div className="p-3 text-sm text-gray-500">Buscando ciudades...</div>
                      )}
                      {cityAutocomplete.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCitySelect(suggestion.value)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">{suggestion.value}</span>
                            <span className="text-xs text-gray-500">{suggestion.count} canchas</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Distrito */}
                <div className="relative" ref={districtDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Distrito (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Distrito específico"
                    value={searchParams.district || districtAutocomplete.query}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchParams(prev => ({ ...prev, district: value }));
                      districtAutocomplete.updateQuery(value);
                      setShowDistrictDropdown(true);
                    }}
                    onFocus={() => setShowDistrictDropdown(true)}
                    disabled={!searchParams.city}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {showDistrictDropdown && searchParams.city && (districtAutocomplete.hasSuggestions || districtAutocomplete.loading) && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {districtAutocomplete.loading && (
                        <div className="p-3 text-sm text-gray-500">Buscando distritos...</div>
                      )}
                      {districtAutocomplete.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDistrictSelect(suggestion.value)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">{suggestion.value}</span>
                            <span className="text-xs text-gray-500">{suggestion.count} canchas</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fecha */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {searchParams.fecha ? formatDate(searchParams.fecha) : 'Cualquier día'}
                  </button>
                  {showCalendar && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 p-4">
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((day) => (
                          <button
                            key={day.date}
                            type="button"
                            onClick={() => handleDateSelect(day.date)}
                            className={`
                              p-2 text-xs rounded hover:bg-blue-50 border
                              ${day.isToday ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                              ${searchParams.fecha === day.date ? 'bg-blue-500 text-white' : 'text-gray-700'}
                            `}
                          >
                            <div className="text-center">
                              <div className="font-medium">{day.day}</div>
                              <div className="text-xs opacity-75">{day.month}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchParams(prev => ({ ...prev, fecha: '' }));
                            setShowCalendar(false);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Limpiar fecha
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Horario */}
                <div className="relative" ref={timePickerRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Horario
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {searchParams.horaInicio || searchParams.horaFin
                      ? `${searchParams.horaInicio || '--'} - ${searchParams.horaFin || '--'}`
                      : 'Cualquier hora'
                    }
                  </button>
                  {showTimePicker && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Hora de inicio</label>
                          <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                            {HOURS.map((hour) => (
                              <button
                                key={`start-${hour}`}
                                type="button"
                                onClick={() => handleTimeSelect(hour, 'inicio')}
                                className={`
                                  p-2 text-xs rounded border hover:bg-blue-50
                                  ${searchParams.horaInicio === hour
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-gray-300 text-gray-700'
                                  }
                                `}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Hora de fin</label>
                          <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                            {HOURS.map((hour) => (
                              <button
                                key={`end-${hour}`}
                                type="button"
                                onClick={() => handleTimeSelect(hour, 'fin')}
                                className={`
                                  p-2 text-xs rounded border hover:bg-blue-50
                                  ${searchParams.horaFin === hour
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-gray-300 text-gray-700'
                                  }
                                `}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchParams(prev => ({
                              ...prev,
                              horaInicio: '',
                              horaFin: ''
                            }));
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Limpiar horarios
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deporte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Dumbbell className="w-4 h-4 inline mr-1" />
                    Deporte
                  </label>
                  <select
                    value={searchParams.disciplina || ''}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      disciplina: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SPORTS.map((sport) => (
                      <option key={sport.value} value={sport.value}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de búsqueda */}
                <button
                  type="submit"
                  disabled={search.loading}
                  className={`
                    w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white
                    ${search.loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    }
                    transition-colors duration-200
                  `}
                >
                  {search.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar canchas
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Search Form */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* 📍 UBICACIÓN - CIUDAD */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="¿Dónde quieres jugar?"
                  value={searchParams.city || cityAutocomplete.query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchParams(prev => ({ ...prev, city: value }));
                    cityAutocomplete.updateQuery(value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Dropdown de ciudades */}
                {showCityDropdown && (cityAutocomplete.hasSuggestions || cityAutocomplete.loading) && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                    {cityAutocomplete.loading && (
                      <div className="p-3 text-sm text-gray-500">Buscando ciudades...</div>
                    )}

                    {cityAutocomplete.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleCitySelect(suggestion.value)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">{suggestion.value}</span>
                          <span className="text-xs text-gray-500">{suggestion.count} canchas</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {cityAutocomplete.error && (
                  <div className="text-xs text-red-500 mt-1">{cityAutocomplete.error}</div>
                )}
              </div>

              {/* 🗺️ DISTRITO */}
              <div className="relative" ref={districtDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Distrito (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Distrito específico"
                  value={searchParams.district || districtAutocomplete.query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchParams(prev => ({ ...prev, district: value }));
                    districtAutocomplete.updateQuery(value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                  disabled={!searchParams.city}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                {/* Dropdown de distritos */}
                {showDistrictDropdown && searchParams.city && (districtAutocomplete.hasSuggestions || districtAutocomplete.loading) && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                    {districtAutocomplete.loading && (
                      <div className="p-3 text-sm text-gray-500">Buscando distritos...</div>
                    )}

                    {districtAutocomplete.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDistrictSelect(suggestion.value)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">{suggestion.value}</span>
                          <span className="text-xs text-gray-500">{suggestion.count} canchas</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {districtAutocomplete.error && (
                  <div className="text-xs text-red-500 mt-1">{districtAutocomplete.error}</div>
                )}
              </div>

              {/* 📅 FECHA */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha
                </label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {searchParams.fecha ? formatDate(searchParams.fecha) : 'Cualquier día'}
                </button>

                {/* Calendario */}
                {showCalendar && (
                  <div className="absolute top-full left-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 p-4 w-80">
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => handleDateSelect(day.date)}
                          className={`
                            p-2 text-xs rounded hover:bg-blue-50 border
                            ${day.isToday ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                            ${searchParams.fecha === day.date ? 'bg-blue-500 text-white' : 'text-gray-700'}
                          `}
                        >
                          <div className="text-center">
                            <div className="font-medium">{day.day}</div>
                            <div className="text-xs opacity-75">{day.month}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchParams(prev => ({ ...prev, fecha: '' }));
                          setShowCalendar(false);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Limpiar fecha
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ⏰ HORA */}
              <div className="relative" ref={timePickerRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horario
                </label>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {searchParams.horaInicio || searchParams.horaFin
                    ? `${searchParams.horaInicio || '--'} - ${searchParams.horaFin || '--'}`
                    : 'Cualquier hora'
                  }
                </button>

                {/* Selector de horarios */}
                {showTimePicker && (
                  <div className="absolute top-full left-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 p-4 w-64">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Hora de inicio</label>
                        <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                          {HOURS.map((hour) => (
                            <button
                              key={`start-${hour}`}
                              type="button"
                              onClick={() => handleTimeSelect(hour, 'inicio')}
                              className={`
                                p-2 text-xs rounded border hover:bg-blue-50
                                ${searchParams.horaInicio === hour
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-gray-300 text-gray-700'
                                }
                              `}
                            >
                              {hour}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Hora de fin</label>
                        <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                          {HOURS.map((hour) => (
                            <button
                              key={`end-${hour}`}
                              type="button"
                              onClick={() => handleTimeSelect(hour, 'fin')}
                              className={`
                                p-2 text-xs rounded border hover:bg-blue-50
                                ${searchParams.horaFin === hour
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-gray-300 text-gray-700'
                                }
                              `}
                            >
                              {hour}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchParams(prev => ({
                            ...prev,
                            horaInicio: '',
                            horaFin: ''
                          }));
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Limpiar horarios
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 🏆 DEPORTE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Dumbbell className="w-4 h-4 inline mr-1" />
                  Deporte
                </label>
                <select
                  value={searchParams.disciplina || ''}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    disciplina: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SPORTS.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BOTÓN DE BÚSQUEDA */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={search.loading}
                className={`
                  inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white
                  ${search.loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                  }
                  transition-colors duration-200
                `}
              >
                {search.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar canchas
                  </>
                )}
              </button>
            </div>

            {/* INFORMACIÓN DE RESULTADOS */}
            {search.totalResults > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                {search.loading ? (
                  'Actualizando resultados...'
                ) : (
                  `${search.totalResults} canchas encontradas${searchParams.city ? ` en ${searchParams.city}` : ''
                  }${searchParams.district ? `, ${searchParams.district}` : ''}`
                )}
              </div>
            )}

            {/* ERROR */}
            {search.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-700">
                  <strong>Error:</strong> {search.error}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegratedSearchBar;