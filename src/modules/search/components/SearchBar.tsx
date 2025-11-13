'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Dumbbell } from 'lucide-react';
import { searchApiService } from '../services/searchApi.service';

export interface SportSearchParams {
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  discipline: string;
}

interface SportsSearchBarProps {
  onSearch: (params: SportSearchParams) => void;
}

interface Discipline {
  idDisciplina: number;
  nombre: string;
}

interface Venue {
  idSede: number;
  nombre: string;
}

export default function SportsSearchBar({ onSearch }: SportsSearchBarProps) {
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [showDisciplineDropdown, setShowDisciplineDropdown] = useState(false);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  
  // Estados para autocompletado
  const [disciplineResults, setDisciplineResults] = useState<Discipline[]>([]);
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [isDisciplineLoading, setIsDisciplineLoading] = useState(false);
  const [isVenueLoading, setIsVenueLoading] = useState(false);
  
  // Referencias para cerrar dropdowns al hacer click fuera
  const disciplineRef = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);

  // Efecto para buscar disciplinas con debounce
  useEffect(() => {
    const searchDisciplines = async () => {
      if (discipline.length >= 2) {
        setIsDisciplineLoading(true);
        const results = await searchApiService.searchDisciplines(discipline);
        setDisciplineResults(results);
        setIsDisciplineLoading(false);
        setShowDisciplineDropdown(true);
      } else {
        setDisciplineResults([]);
        setShowDisciplineDropdown(false);
      }
    };

    const timer = setTimeout(searchDisciplines, 300);
    return () => clearTimeout(timer);
  }, [discipline]);

  // Efecto para buscar sedes con debounce
  useEffect(() => {
    const searchVenues = async () => {
      if (venue.length >= 2) {
        setIsVenueLoading(true);
        const results = await searchApiService.searchVenues(venue);
        setVenueResults(results);
        setIsVenueLoading(false);
        setShowVenueDropdown(true);
      } else {
        setVenueResults([]);
        setShowVenueDropdown(false);
      }
    };

    const timer = setTimeout(searchVenues, 300);
    return () => clearTimeout(timer);
  }, [venue]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (disciplineRef.current && !disciplineRef.current.contains(event.target as Node)) {
        setShowDisciplineDropdown(false);
      }
      if (venueRef.current && !venueRef.current.contains(event.target as Node)) {
        setShowVenueDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      venue,
      date,
      startTime,
      endTime,
      discipline,
    });
  };

  return (
    <div className="relative bg-white shadow-lg rounded-xl p-3 sm:p-4 mx-auto max-w-6xl border border-primary-200">
      <form onSubmit={handleSearch} className="w-full">
        {/* Grid Layout - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Venue Input con Autocompletado */}
          <div className="relative lg:col-span-2" ref={venueRef}>
            <label htmlFor="venue" className="block text-xs font-medium text-gray-600 mb-1">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-500" />
              <input
                id="venue"
                type="text"
                placeholder="Buscar sede..."
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                onFocus={() => venue.length >= 2 && setShowVenueDropdown(true)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
              
              {/* Dropdown de Sedes */}
              {showVenueDropdown && (venueResults.length > 0 || isVenueLoading) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isVenueLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Buscando...</div>
                  ) : (
                    venueResults.map((v) => (
                      <button
                        key={v.idSede}
                        type="button"
                        onClick={() => {
                          setVenue(v.nombre);
                          setShowVenueDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {v.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-gray-600 mb-1">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-500" />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Start Time Input */}
          <div>
            <label htmlFor="startTime" className="block text-xs font-medium text-gray-600 mb-1">
              Inicio
            </label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-500" />
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* End Time Input */}
          <div>
            <label htmlFor="endTime" className="block text-xs font-medium text-gray-600 mb-1">
              Fin
            </label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-500" />
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Discipline Input con Autocompletado */}
          <div className="relative" ref={disciplineRef}>
            <label htmlFor="discipline" className="block text-xs font-medium text-gray-600 mb-1">
              Deporte
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-500" />
              <input
                id="discipline"
                type="text"
                placeholder="Buscar deporte..."
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                onFocus={() => discipline.length >= 2 && setShowDisciplineDropdown(true)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />

              {/* Dropdown de Disciplinas */}
              {showDisciplineDropdown && (disciplineResults.length > 0 || isDisciplineLoading) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isDisciplineLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Buscando...</div>
                  ) : (
                    disciplineResults.map((disc) => (
                      <button
                        key={disc.idDisciplina}
                        type="button"
                        onClick={() => {
                          setDiscipline(disc.nombre);
                          setShowDisciplineDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {disc.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Button - Compacto */}
        <div className="mt-3 flex justify-center sm:justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
