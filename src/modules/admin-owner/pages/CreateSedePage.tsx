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
          console.log('📍 Ubicación del usuario:', latitude, longitude);
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

      console.log('📤 Enviando datos de sede:', sedeData);

      const response = await fetch('http://localhost:3000/api/sede', {
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-blue-100">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Inicia sesión</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Debes iniciar sesión para crear una sede deportiva.
          </p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-red-100">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Solo los dueños pueden crear sedes deportivas.
          </p>
          <button
            onClick={() => navigate('/host-space')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Convertirme en dueño
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm border border-blue-100">
            <Building2 className="h-4 w-4" />
            Panel de Dueño
          </p>
          <h1 className="mt-4 text-4xl font-black text-gray-900 tracking-tight">
            🏢 Crear Nueva Sede
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Completa los pasos para registrar tu sede deportiva en la plataforma.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500 bg-blue-600 text-white shadow-lg scale-110'
                          : isCompleted
                          ? 'border-green-500 bg-green-500 text-white shadow-md'
                          : 'border-gray-200 bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                      <span className="absolute -bottom-5 text-[0.65rem] font-semibold text-gray-500">
                        Paso {step.id}
                      </span>
                    </div>
                    <p
                      className={`mt-7 text-xs sm:text-sm font-semibold text-center ${
                        isActive
                          ? 'text-blue-700'
                          : isCompleted
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div className="flex flex-1 items-center">
                      <div
                        className={`h-1 w-full rounded-full transition-all duration-300 ${
                          currentStep > step.id
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : 'bg-gray-200'
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">Atención</p>
                <p className="mt-1 text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">Información Básica</h3>
                <p className="text-sm text-gray-600">
                  Empecemos por lo esencial: el nombre de tu sede.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Nombre de la Sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Complejo Deportivo Los Campeones"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <p className="text-xs text-gray-500">
                  Este será el nombre visible para los usuarios al buscar tu sede.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Ubicación */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Ubicación
                </h3>
                <p className="text-sm text-gray-600">
                  Selecciona la ubicación exacta de tu sede en el mapa. Usamos tu ubicación actual
                  o Santa Cruz como punto de partida por defecto.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Ubicación en el Mapa <span className="text-red-500">*</span>
                </label>

                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner">
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
                    height="420px"
                    zoom={13}
                  />
                </div>

                {/* Coordenadas estilizadas */}
                <div className="mt-3 grid gap-2 text-xs sm:text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-sm border border-gray-100">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                      Latitud
                    </span>
                    <span className="font-mono text-gray-900">
                      {formData.latitud ? formData.latitud.toFixed(6) : 'No seleccionada'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-sm border border-gray-100">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                      Longitud
                    </span>
                    <span className="font-mono text-gray-900">
                      {formData.longitud ? formData.longitud.toFixed(6) : 'No seleccionada'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Cristo Redentor #1234"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Horarios y Contacto
                </h3>
                <p className="text-sm text-gray-600">
                  Define cómo pueden contactarte y en qué horarios atiende tu sede.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 77123456"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej: contacto@misede.com"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Hora de Apertura
                  </label>
                  <input
                    type="time"
                    name="horarioApertura"
                    value={formData.horarioApertura}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Hora de Cierre
                  </label>
                  <input
                    type="time"
                    name="horarioCierre"
                    value={formData.horarioCierre}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Detalles */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Detalles Adicionales
                </h3>
                <p className="text-sm text-gray-600">
                  Añade información extra para hacer tu sede más atractiva.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe tu sede, instalaciones, servicios adicionales, parqueos, etc..."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Resumen + Mini mapa de selección */}
              <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resumen de la Sede
                </h4>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-800">Nombre: </span>
                      <span className="text-gray-700">{formData.nombre || '—'}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Dirección: </span>
                      <span className="text-gray-700">
                        {formData.direccion || '—'}
                        {formData.ciudad ? `, ${formData.ciudad}` : ''}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Teléfono: </span>
                      <span className="text-gray-700">{formData.telefono || '—'}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Email: </span>
                      <span className="text-gray-700">{formData.email || '—'}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Horario: </span>
                      <span className="text-gray-700">
                        {formData.horarioApertura} - {formData.horarioCierre}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Coordenadas: </span>
                      <span className="text-gray-700 font-mono">
                        {formData.latitud && formData.longitud
                          ? `${formData.latitud.toFixed(6)}, ${formData.longitud.toFixed(6)}`
                          : 'No seleccionadas'}
                      </span>
                    </p>
                  </div>

                  {/* Mini mapa de selección para afinar ubicación */}
                  <div className="mt-2 h-44 rounded-xl border border-blue-200 bg-white/80 shadow-inner overflow-hidden">
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
                      zoom={15}
                    />
                  </div>
                </div>

                <p className="mt-3 text-[0.75rem] text-gray-600">
                  Puedes mover el mini mapa para ajustar ligeramente la posición de tu sede antes de
                  crearla.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                currentStep === 1
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-7 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
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
