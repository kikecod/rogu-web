import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Clock, FileText, CheckCircle, 
  ChevronRight, ChevronLeft, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import MapPicker from '@/components/MapPicker';
import { DEFAULT_COORDINATES } from '../../../config/map.config';
import { ROUTES } from '@/config/routes';

interface SedeFormData {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  descripcion: string;
  latitud: number | null;
  longitud: number | null;
}

const STEPS = [
  { id: 1, name: 'Información Básica', icon: Building2 },
  { id: 2, name: 'Ubicación', icon: MapPin },
  { id: 3, name: 'Horarios y Contacto', icon: Clock },
  { id: 4, name: 'Detalles', icon: FileText },
];

const CreateSedePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isDuenio } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState<SedeFormData>({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    horarioApertura: '06:00',
    horarioCierre: '23:00',
    descripcion: '',
    latitud: null,
    longitud: null,
  });

  // Obtener ubicación del usuario al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Si no hay coordenadas en el formulario, usar la ubicación del usuario
          if (!formData.latitud && !formData.longitud) {
            setFormData(prev => ({
              ...prev,
              latitud: latitude,
              longitud: longitude
            }));
          }

          console.log('📍 Ubicación del usuario:', latitude, longitude);
        },
        (error) => {
          console.warn('⚠️ No se pudo obtener ubicación:', error);
          // Usar ubicación por defecto (Santa Cruz)
          setUserLocation(DEFAULT_COORDINATES.SANTA_CRUZ);
        }
      );
    } else {
      // Geolocation no soportado, usar ubicación por defecto
      setUserLocation(DEFAULT_COORDINATES.SANTA_CRUZ);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.nombre.trim()) {
          setError('El nombre de la sede es requerido');
          return false;
        }
        break;
      case 2:
        if (!formData.latitud || !formData.longitud) {
          setError('Por favor selecciona una ubicación en el mapa');
          return false;
        }
        if (!formData.direccion.trim()) {
          setError('La dirección es requerida');
          return false;
        }
        if (!formData.ciudad.trim()) {
          setError('La ciudad es requerida');
          return false;
        }
        break;
      case 3:
        if (!formData.telefono.trim()) {
          setError('El teléfono es requerido');
          return false;
        }
        if (!formData.email.trim()) {
          setError('El email es requerido');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('El email no es válido');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (!isLoggedIn || !user) {
      setError('Debes iniciar sesión para crear una sede');
      return;
    }

    if (!isDuenio()) {
      setError('Solo los dueños pueden crear sedes');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const sedeData = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        telefono: formData.telefono,
        email: formData.email,
        horarioApertura: formData.horarioApertura,
        horarioCierre: formData.horarioCierre,
        descripcion: formData.descripcion || '',
        latitud: formData.latitud,
        longitud: formData.longitud,
        idPersona: user.idPersona
      };

      console.log('📤 Enviando datos de sede:', sedeData);

      const response = await fetch('http://localhost:3000/api/sede', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sedeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sede');
      }

      const result = await response.json();
      console.log('✅ Sede creada:', result);

      // Redirigir a la página de administración
      setTimeout(() => {
        navigate('/admin-spaces');
      }, 1500);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la sede');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar autenticación
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicia sesión</h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para crear una sede
          </p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!isDuenio()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Solo los dueños pueden crear sedes deportivas
          </p>
          <button
            onClick={() => navigate('/host-space')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Convertirme en dueño
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            🏢 Crear Nueva Sede
          </h1>
          <p className="text-lg text-gray-600">
            Completa los pasos para registrar tu sede deportiva
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 text-white scale-110 shadow-lg'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs sm:text-sm font-medium text-center ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4 mt-0 sm:mt-0">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Información Básica</h3>
                <p className="text-gray-600">Ingresa los datos principales de tu sede</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Complejo Deportivo Los Campeones"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Ubicación */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📍 Ubicación</h3>
                <p className="text-gray-600">Selecciona la ubicación exacta de tu sede en el mapa</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ubicación en el Mapa *
                </label>
                <MapPicker
                  initialLat={userLocation?.lat || DEFAULT_COORDINATES.SANTA_CRUZ.lat}
                  initialLng={userLocation?.lng || DEFAULT_COORDINATES.SANTA_CRUZ.lng}
                  onLocationSelect={handleLocationSelect}
                  height="450px"
                  zoom={13}
                />
                {formData.latitud && formData.longitud && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✅ Coordenadas: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Cristo Redentor #1234"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona una ciudad</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Sucre">Sucre</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Potosí">Potosí</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Beni">Beni</option>
                    <option value="Pando">Pando</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Horarios y Contacto */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🕐 Horarios y Contacto</h3>
                <p className="text-gray-600">Información de contacto y horarios de atención</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 77123456"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej: contacto@misede.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hora de Apertura
                  </label>
                  <input
                    type="time"
                    name="horarioApertura"
                    value={formData.horarioApertura}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hora de Cierre
                  </label>
                  <input
                    type="time"
                    name="horarioCierre"
                    value={formData.horarioCierre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Detalles */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📝 Detalles Adicionales</h3>
                <p className="text-gray-600">Información adicional sobre tu sede</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Describe tu sede, servicios adicionales, etc..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Resumen */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">📋 Resumen de la Sede</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nombre:</span> {formData.nombre}</p>
                  <p><span className="font-semibold">Dirección:</span> {formData.direccion}, {formData.ciudad}</p>
                  <p><span className="font-semibold">Teléfono:</span> {formData.telefono}</p>
                  <p><span className="font-semibold">Email:</span> {formData.email}</p>
                  <p><span className="font-semibold">Horario:</span> {formData.horarioApertura} - {formData.horarioCierre}</p>
                  <p><span className="font-semibold">Coordenadas:</span> {formData.latitud?.toFixed(6)}, {formData.longitud?.toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Siguiente
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Crear Sede
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSedePage;
