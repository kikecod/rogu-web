import React, { useState } from 'react';
import { MapPin, Map } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import DistrictAutocomplete from './DistrictAutocomplete';

interface LocationAutocompleteProps {
  onLocationChange: (location: { city: string; district?: string }) => void;
  initialCity?: string;
  initialDistrict?: string;
  className?: string;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onLocationChange,
  initialCity = '',
  initialDistrict = '',
  className = '',
  disabled = false,
  layout = 'horizontal'
}) => {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  // Manejar selección de ciudad
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict(''); // Limpiar distrito al cambiar ciudad
    
    onLocationChange({
      city,
      district: undefined
    });
  };

  // Manejar selección de distrito
  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    
    onLocationChange({
      city: selectedCity,
      district
    });
  };

  // Limpiar ciudad
  const handleClearCity = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    
    onLocationChange({
      city: '',
      district: undefined
    });
  };

  // Limpiar distrito
  const handleClearDistrict = () => {
    setSelectedDistrict('');
    
    onLocationChange({
      city: selectedCity,
      district: undefined
    });
  };

  const containerClass = layout === 'horizontal' 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
    : 'space-y-4';

  return (
    <div className={`${className}`}>
      <div className={containerClass}>
        {/* AUTOCOMPLETADO DE CIUDAD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Ciudad
          </label>
          <CityAutocomplete
            value={selectedCity}
            placeholder="¿En qué ciudad buscas?"
            onSelect={handleCitySelect}
            onClear={handleClearCity}
            disabled={disabled}
          />
        </div>

        {/* AUTOCOMPLETADO DE DISTRITO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Map className="w-4 h-4 inline mr-1" />
            Distrito (opcional)
          </label>
          <DistrictAutocomplete
            city={selectedCity}
            value={selectedDistrict}
            placeholder="Distrito específico"
            onSelect={handleDistrictSelect}
            onClear={handleClearDistrict}
            disabled={disabled}
          />
        </div>
      </div>

      {/* RESUMEN DE UBICACIÓN SELECCIONADA */}
      {(selectedCity || selectedDistrict) && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800">
              Ubicación seleccionada: 
              <span className="font-medium ml-1">
                {selectedDistrict ? `${selectedDistrict}, ` : ''}{selectedCity}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;