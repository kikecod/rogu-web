import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { sedesService } from '../services/sedes.service';
import { useSedeDetalle } from '../hooks';
import type { CrearSedeDto, EditarSedeDto } from '../types';
import MapPicker from '../../../venues/components/MapPicker';

const SedeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const { sede, loading: cargandoSede } = useSedeDetalle(Number(id));

  const [formData, setFormData] = useState<CrearSedeDto | EditarSedeDto>({
    nombre: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    distrito: '',
    estado: '',
    telefono: '',
    email: '',
    latitud: undefined,
    longitud: undefined,
    idDuenio: 1, // TODO: Obtener del sistema o selector
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos de la sede si es edición
  useEffect(() => {
    if (esEdicion && sede) {
      setFormData({
        nombre: sede.nombre || '',
        descripcion: sede.descripcion || '',
        direccion: sede.direccion || '',
        ciudad: sede.ciudad || sede.city || '',
        distrito: sede.distrito || sede.district || '',
        estado: sede.estado || '',
        telefono: sede.telefono || '',
        email: sede.email || '',
        latitud: sede.latitud ?? undefined,
        longitud: sede.longitud ?? undefined,
        activa: sede.activa ?? true,
        verificada: sede.verificada ?? false,
      });
    }
  }, [esEdicion, sede]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value ? parseFloat(value) : undefined) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion?.trim()) {
      nuevosErrores.direccion = 'La dirección es requerida';
    }

    if (!formData.ciudad?.trim()) {
      nuevosErrores.ciudad = 'La ciudad es requerida';
    }

    if (!esEdicion && !(formData as CrearSedeDto).idDuenio) {
      nuevosErrores.idDuenio = 'Debe seleccionar un dueño';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (esEdicion && id) {
        // Editar sede existente - Mapear y limpiar datos
        const { activa, verificada, ciudad, distrito, estado, latitud, longitud, direccion, ...resto } = formData as any;
        
        const datosParaEnviar: any = {
          ...resto,
          city: ciudad,
          district: distrito,
          stateProvince: estado,
          addressLine: direccion,
          latitude: latitud ? parseFloat(latitud.toString()) : undefined,
          longitude: longitud ? parseFloat(longitud.toString()) : undefined,
        };

        // Remover campos undefined
        Object.keys(datosParaEnviar).forEach(key => {
          if (datosParaEnviar[key] === undefined || datosParaEnviar[key] === '') {
            delete datosParaEnviar[key];
          }
        });

        await sedesService.editar(Number(id), datosParaEnviar);
        navigate(`/admin/sedes/${id}`);
      } else {
        // Crear nueva sede
        const respuesta = await sedesService.crear(formData as CrearSedeDto);
        navigate(`/admin/sedes/${respuesta.sede.idSede}`);
      }
    } catch (err: any) {
      console.error('Error al guardar sede:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar la sede');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (esEdicion && id) {
      navigate(`/admin/sedes/${id}`);
    } else {
      navigate('/admin/sedes');
    }
  };

  if (esEdicion && cargandoSede) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleCancelar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {esEdicion ? 'Editar Sede' : 'Nueva Sede'}
          </h1>
          <p className="text-gray-600 mt-1">
            {esEdicion
              ? 'Modifica la información de la sede'
              : 'Completa la información para crear una nueva sede'}
          </p>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Error al guardar</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Información básica */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Sede <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Complejo Deportivo Central"
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe las características y servicios de la sede..."
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.direccion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Av. Siempre Viva 123"
              />
              {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ciudad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Santa Cruz"
              />
              {errors.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>}
            </div>

            {/* Distrito */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
              <input
                type="text"
                name="distrito"
                value={formData.distrito}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Centro"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado/Provincia</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Santa Cruz"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: +591 12345678"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: contacto@sede.com"
              />
            </div>
          </div>

          {/* Mapa de Ubicación */}
          <div className="mt-6">
            <MapPicker
              latitude={formData.latitud ?? null}
              longitude={formData.longitud ?? null}
              onLocationSelect={(lat, lng) => {
                setFormData(prev => ({
                  ...prev,
                  latitud: lat,
                  longitud: lng
                }));
              }}
              height="450px"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancelar}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                {esEdicion ? 'Guardar Cambios' : 'Crear Sede'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SedeFormPage;
