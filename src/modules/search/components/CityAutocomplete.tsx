import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { useCityAutocomplete } from '../hooks';

interface CityAutocompleteProps {
  value?: string;
  placeholder?: string;
  onSelect: (city: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value = '',
  placeholder = 'Buscar ciudad...',
  onSelect,
  onClear,
  className = '',
  disabled = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    loading,
    error,
    updateQuery,
    clearSuggestions,
    hasSuggestions
  } = useCityAutocomplete({
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 8
  });

  // Sincronizar valor externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    updateQuery(newValue);
    setShowDropdown(true);
  };

  // Manejar selección
  const handleSelect = (city: string) => {
    setInputValue(city);
    onSelect(city);
    clearSuggestions();
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Manejar focus
  const handleFocus = () => {
    if (inputValue.length >= 2) {
      setShowDropdown(true);
    }
  };

  // Limpiar input
  const handleClear = () => {
    setInputValue('');
    clearSuggestions();
    setShowDropdown(false);
    onClear?.();
    inputRef.current?.focus();
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
        />
        
        {/* Icono de búsqueda */}
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {/* Indicador de carga */}
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Botón de limpiar */}
        {inputValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showDropdown && !disabled && (hasSuggestions || loading || error) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading && !hasSuggestions && (
            <div className="p-4 text-center text-sm text-gray-500">
              <Search className="w-4 h-4 mx-auto mb-2" />
              Buscando ciudades...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {hasSuggestions && (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(suggestion.value)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{suggestion.value}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {suggestion.count} {suggestion.count === 1 ? 'cancha' : 'canchas'}
                    </span>
                  </div>
                </button>
              ))}
              
              {suggestions.length === 0 && inputValue.length >= 2 && !loading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No se encontraron ciudades con "{inputValue}"
                </div>
              )}
            </>
          )}

          {!loading && !hasSuggestions && !error && inputValue.length < 2 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error debajo del input */}
      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;