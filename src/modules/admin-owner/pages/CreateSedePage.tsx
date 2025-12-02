import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  ArrowLeft
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
  { id: 1, name: 'Información', icon: Building2 },
  { id: 2, name: 'Ubicación', icon: MapPin },
  { id: 3, name: 'Horarios', icon: Clock },
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

  // Obtener ubicación del usuario al cargar (y setear lat/lng por defecto)
  useEffect(() => {
    const setDefaultLocation = (lat: number, lng: number) => {
      setUserLocation({ lat, lng });
      setFormData(prev => {
        // Si ya hay coordenadas, respetarlas
        if (prev.latitud && prev.longitud) return prev;
        return {
          ...prev,
          latitud: lat,
          longitud: lng,
        };
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setDefaultLocation(latitude, longitude);
        },
        error => {
          console.warn('⚠️ No se pudo obtener ubicación:', error);
          const { lat, lng } = DEFAULT_COORDINATES.SANTA_CRUZ;
          setDefaultLocation(lat, lng);
        }
      );
    } else {
      const { lat, lng } = DEFAULT_COORDINATES.SANTA_CRUZ;
      setDefaultLocation(lat, lng);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
        idPersona: user.idPersona,
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sedeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sede');
      }

      const result = await response.json();
      console.log('✅ Sede creada:', result);

      setTimeout(() => {
        navigate(ROUTES.owner.spaces);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para crear una sede deportiva.
          </p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!isDuenio()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Solo los dueños pueden crear sedes deportivas.
          </p>
          <button
            onClick={() => navigate('/host-space')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Convertirme en dueño
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Nueva Sede</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Paso {currentStep} de {STEPS.length}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center bg-gray-50 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                        ? 'bg-primary-600 text-white shadow-lg scale-110 ring-4 ring-primary-100'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}
                  >
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold transition-colors ${isActive ? 'text-primary-700' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Información Básica */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Información Básica</h2>
                  <p className="text-gray-500 mt-2">Comencemos con el nombre de tu complejo deportivo.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Sede <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Complejo Deportivo Los Campeones"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 2: Ubicación */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Ubicación</h2>
                  <p className="text-gray-500 mt-2">Selecciona la ubicación exacta en el mapa.</p>
                </div>

                <div className="space-y-4">
                  <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative group">
                    <MapPicker
                      initialLat={
                        formData.latitud ??
                        userLocation?.lat ??
                        DEFAULT_COORDINATES.SANTA_CRUZ.lat
                      }
                      initialLng={
                        formData.longitud ??
                        userLocation?.lng ??
                        DEFAULT_COORDINATES.SANTA_CRUZ.lng
                      }
                      onLocationSelect={handleLocationSelect}
                      height="100%"
                      zoom={13}
                    />
                    {!formData.latitud && (
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700">
                          Haz clic en el mapa para seleccionar
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Ej: Av. Cristo Redentor #1234"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ciudad <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all bg-white"
                      >
                        <option value="">Selecciona una ciudad</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="La Paz">La Paz</option>
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
              </div>
            )}

            {/* Step 3: Horarios y Contacto */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Horarios y Contacto</h2>
                  <p className="text-gray-500 mt-2">Define cómo pueden contactarte tus clientes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="Ej: 77123456"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ej: contacto@misede.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hora de Apertura
                    </label>
                    <input
                      type="time"
                      name="horarioApertura"
                      value={formData.horarioApertura}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hora de Cierre
                    </label>
                    <input
                      type="time"
                      name="horarioCierre"
                      value={formData.horarioCierre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Detalles y Resumen */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detalles Finales</h2>
                  <p className="text-gray-500 mt-2">Revisa la información antes de crear tu sede.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe tu sede, instalaciones, servicios adicionales..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Resumen
                  </h3>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Nombre</dt>
                      <dd className="font-medium text-gray-900">{formData.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Ubicación</dt>
                      <dd className="font-medium text-gray-900">{formData.ciudad}, {formData.direccion}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Contacto</dt>
                      <dd className="font-medium text-gray-900">{formData.telefono}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Horario</dt>
                      <dd className="font-medium text-gray-900">{formData.horarioApertura} - {formData.horarioCierre}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
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
