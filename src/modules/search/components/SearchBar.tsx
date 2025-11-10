import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Dumbbell, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  className?: string;
}

export interface SearchParams {
  location: string;
  date: string;
  time: string;
  sport: string;
}

const SPORTS = [
  { value: '', label: 'Todos los deportes' },
  { value: 'football', label: '⚽ Fútbol' },
  { value: 'basketball', label: '🏀 Básquetbol' },
  { value: 'tennis', label: '🎾 Tenis' },
  { value: 'volleyball', label: '🏐 Vóleibol' },
  { value: 'paddle', label: '🎾 Pádel' },
  { value: 'hockey', label: '🏒 Hockey' },
];

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    date: '',
    time: '',
    sport: '',
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
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleDateSelect = (date: string) => {
    setSearchParams({ ...searchParams, date });
    setShowCalendar(false);
  };

  const handleTimeSelect = (time: string) => {
    setSearchParams({ ...searchParams, time });
    setShowTimePicker(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  return (
    <>
      {/* Placeholder cuando el SearchBar se vuelve sticky */}
      {isSticky && <div className="h-20" />}

      <div
        ref={searchBarRef}
        className={`
          ${isSticky ? 'fixed top-0 left-0 right-0 z-50 animate-slide-down shadow-xl bg-white/95 backdrop-blur-md' : 'relative'}
          transition-all duration-300
          ${className}
        `}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
            {/* Location */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="Ubicación"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Date */}
            <div className="relative flex-1 min-w-0" ref={calendarRef}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={formatDate(searchParams.date) || ''}
                  onClick={() => setShowCalendar(!showCalendar)}
                  placeholder="Fecha"
                  readOnly
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all"
                />
              </div>

              {/* Calendar Dropdown */}
              {showCalendar && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-fade-in w-80">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Selecciona fecha</h3>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((date, i) => {
                      const dateString = date.toISOString().split('T')[0];
                      const isSelected = searchParams.date === dateString;
                      const isToday = i === 0;
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDateSelect(dateString)}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all
                            ${isSelected 
                              ? 'bg-blue-600 text-white shadow-lg scale-105' 
                              : isToday
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Time */}
            <div className="relative flex-1 min-w-0" ref={timePickerRef}>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchParams.time}
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  placeholder="Hora"
                  readOnly
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all"
                />
              </div>

              {/* Time Picker Dropdown */}
              {showTimePicker && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-fade-in w-56">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">Selecciona hora</h3>
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleTimeSelect(hour)}
                        className={`
                          py-2 px-3 rounded-lg text-sm font-medium transition-all
                          ${searchParams.time === hour
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sport */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={searchParams.sport}
                  onChange={(e) => setSearchParams({ ...searchParams, sport: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                >
                  {SPORTS.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default SearchBar;
