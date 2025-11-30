import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  Star,
  Check,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Image,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { useSedeDetalle } from '../hooks';
import { sedesService } from '../services/sedes.service';
import { verificacionesService } from '../../verificaciones/services/verificaciones.service';
import MapPicker from '../../../venues/components/MapPicker';
import { ROUTES } from '@/config/routes';
import { useCanchasDeSede } from '../canchas/hooks/useCanchasDeSede';
import { SedePhotoManagement } from '../components';

const SedeDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sede, loading, error, recargar } = useSedeDetalle(Number(id));
  const [procesando, setProcesando] = useState(false);
  const [photoManagementOpen, setPhotoManagementOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const {
    canchas: canchasSede,
    loading: loadingCanchas,
    error: errorCanchas,
    total: totalCanchas,
  } = useCanchasDeSede(sede?.idSede);

  const handleVerificar = async () => {
    if (!sede || !window.confirm('¿Estás seguro de que deseas verificar esta sede?')) return;

    try {
      setProcesando(true);
      await sedesService.verificar(sede.idSede);
      alert('Sede verificada exitosamente');
      recargar();
    } catch (err: any) {
      console.error('Error al verificar sede:', err);
      alert(err.response?.data?.message || 'Error al verificar la sede');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!sede) return;

    const motivo = window.prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;

    try {
      setProcesando(true);
      await sedesService.rechazarVerificacion(sede.idSede, motivo);
      alert('Verificación rechazada');
      recargar();
    } catch (err: any) {
      console.error('Error al rechazar sede:', err);
      alert(err.response?.data?.message || 'Error al rechazar la sede');
    } finally {
      setProcesando(false);
    }
  };

  const handleActivar = async () => {
    if (!sede || !window.confirm('¿Estás seguro de que deseas activar esta sede?')) return;

    try {
      setProcesando(true);
      await sedesService.activar(sede.idSede);
      alert('Sede activada exitosamente');
      recargar();
    } catch (err: any) {
      console.error('Error al activar sede:', err);
      alert(err.response?.data?.message || 'Error al activar la sede');
    } finally {
      setProcesando(false);
    }
  };

  const handleDesactivar = async () => {
    if (!sede) return;

    const motivo = window.prompt('Ingresa el motivo de la desactivación:');
    if (!motivo) return;

    try {
      setProcesando(true);
      await sedesService.desactivar(sede.idSede, { motivo, temporal: true });
      alert('Sede desactivada');
      recargar();
    } catch (err: any) {
      console.error('Error al desactivar sede:', err);
      alert(err.response?.data?.message || 'Error al desactivar la sede');
    } finally {
      setProcesando(false);
    }
  };

  const handleVerLicencia = async () => {
    if (!sede) return;
    try {
      setLoadingPreview(true);
      const blob = await verificacionesService.getLicenciaBlob(sede.idSede);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error al cargar la licencia:', error);
      alert('Error al cargar el documento de la licencia');
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !sede) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar la sede</h2>
          <p className="text-red-600 mb-4">{error || 'Sede no encontrada'}</p>
          <button
            onClick={() => navigate('/admin/sedes')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/sedes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sede.nombre}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin size={16} />
              <span>{sede.direccion || `${sede.city}, ${sede.district}`}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/sedes/${id}/editar`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Editar
          </button>
          <button
            onClick={() => {
              /* TODO: Implementar modal de confirmación */
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Estados */}
      <div className="flex gap-2">
        {sede.verificada ? (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Check size={16} />
            Verificada
          </span>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <AlertCircle size={16} />
            Pendiente de verificación
          </span>
        )}
        {sede.activa || sede.estado === 'ACTIVA' ? (
          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Activa
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Inactiva
          </span>
        )}
      </div>

      {/* Botones de verificación (solo si no está verificada) */}
      {!sede.verificada && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Esta sede requiere verificación
              </h3>
              <p className="text-sm text-yellow-700">
                Revisa los datos y documentos antes de aprobar esta sede.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleVerificar}
                disabled={procesando}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} />
                {procesando ? 'Procesando...' : 'Verificar'}
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={18} />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones Administrativas */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Acciones Administrativas</h3>
        <div className="flex flex-wrap gap-2">
          {/* Botón de Gestionar Fotos */}
          <button
            onClick={() => setPhotoManagementOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Image size={18} />
            Gestionar Fotos
          </button>

          {/* Botón de Verificación/Desverificación */}
          {sede.verificada ? (
            <button
              onClick={handleRechazar}
              disabled={procesando}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={18} />
              Desverificar
            </button>
          ) : null}

          {/* Botón de Activar/Desactivar */}
          {sede.activa ? (
            <button
              onClick={handleDesactivar}
              disabled={procesando}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={18} />
              Desactivar
            </button>
          ) : (
            <button
              onClick={handleActivar}
              disabled={procesando}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              Activar
            </button>
          )}
        </div>
      </div>

      {/* Grid de información */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información básica */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos de Verificación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Datos de Verificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">NIT</p>
                <p className="font-semibold text-gray-900">{sede.NIT || 'No especificado'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Licencia de Funcionamiento</p>
                <div className="flex items-center">
                  {sede.LicenciaFuncionamiento ? (
                    <button
                      onClick={handleVerLicencia}
                      disabled={loadingPreview}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium w-full justify-center"
                      title="Ver licencia"
                    >
                      {loadingPreview ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      ) : (
                        <Eye size={16} />
                      )}
                      Ver Licencia
                    </button>
                  ) : (
                    <span className="text-gray-500 italic">No especificado</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <Phone size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                  <p className="font-semibold text-gray-900">{sede.telefono || 'No especificado'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <Mail size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{sede.email || 'No especificado'}</p>
                </div>
              </div>
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <MapPin size={20} className="text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Dirección Completa</p>
                  <p className="font-semibold text-gray-900">
                    {sede.direccion || `${sede.city}, ${sede.district}, ${sede.estado}`}
                  </p>
                  {sede.latitud && sede.longitud && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {sede.latitud}, {sede.longitud}
                    </p>
                  )}
                </div>
              </div>

              {/* Mapa de Ubicación */}
              {sede.latitud && sede.longitud && (
                <div className="md:col-span-2">
                  <MapPicker
                    latitude={Number(sede.latitud)}
                    longitude={Number(sede.longitud)}
                    onLocationSelect={() => { }}
                    height="350px"
                    readOnly={true}
                  />
                </div>
              )}
              {sede.politicas && (
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Políticas</p>
                  <p className="text-sm text-gray-900">{sede.politicas}</p>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Descripción</h2>
            <p className="text-gray-700">{sede.descripcion || 'Sin descripción disponible'}</p>
          </div>

          {/* Estadísticas */}
          {sede.estadisticas && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Building2 className="mx-auto text-blue-600 mb-2" size={24} />
                  <p className="text-sm text-gray-600">Reservas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sede.estadisticas.reservasTotales || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Check className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sede.estadisticas.reservasCompletadas || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="mx-auto text-purple-600 mb-2" size={24} />
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${sede.estadisticas.ingresosTotales?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <TrendingUp className="mx-auto text-yellow-600 mb-2" size={24} />
                  <p className="text-sm text-gray-600">Ocupación</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sede.estadisticas.ocupacionPromedio?.toFixed(1) || '0'}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Canchas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Canchas ({totalCanchas ?? sede?.canchas?.length ?? 0})
              </h2>
              <button
                onClick={() => navigate(ROUTES.admin.sedesCanchas(sede.idSede))}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Gestionar canchas
              </button>
            </div>
            {loadingCanchas ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Cargando canchas...</p>
              </div>
            ) : errorCanchas ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">
                <p>No se pudieron cargar las canchas.</p>
                <p className="text-xs text-red-500">{errorCanchas}</p>
              </div>
            ) : canchasSede.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
                <p>No hay canchas registradas para esta sede.</p>
                <button
                  onClick={() => navigate(ROUTES.admin.sedesCanchasCrear(sede.idSede))}
                  className="rounded-full border border-blue-500 px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Crear cancha
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {canchasSede.slice(0, 3).map((cancha) => (
                  <div
                    key={cancha.idCancha}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{cancha.nombre}</h3>
                      {cancha.descripcion && (
                        <p className="text-sm text-gray-600">{cancha.descripcion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {cancha.activa ?? cancha.estado === 'Disponible' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactiva
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del dueño */}
          {sede.duenio && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dueño</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">
                    {sede.duenio.persona.nombre} {sede.duenio.persona.apellidoPaterno}{' '}
                    {sede.duenio.persona.apellidoMaterno || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuario</p>
                  <p className="font-medium text-gray-900">{sede.duenio.usuario}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo</p>
                  <p className="font-medium text-gray-900">{sede.duenio.correo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Calificación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Calificación</h2>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="text-yellow-500 fill-yellow-500" size={32} />
                <span className="text-4xl font-bold text-gray-900">
                  {sede.promedioCalificacion?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-gray-600">{sede.totalResenas || 0} reseñas</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Fecha de creación</p>
                  <p className="font-medium text-gray-900">
                    {new Date(sede.creadoEn).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {sede.actualizadoEn && (
                <div className="flex items-start gap-2">
                  <Clock className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Última actualización</p>
                    <p className="font-medium text-gray-900">
                      {new Date(sede.actualizadoEn).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de gestión de fotos */}
      {sede && (
        <SedePhotoManagement
          sede={{ idSede: sede.idSede, nombre: sede.nombre }}
          isOpen={photoManagementOpen}
          onClose={() => setPhotoManagementOpen(false)}
        />
      )}

      {/* Modal de Previsualización de Licencia */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Licencia de Funcionamiento - {sede.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download={`licencia-${sede.idSede}.pdf`}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Descargar PDF"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg border border-gray-300 bg-white"
                title={`Licencia ${sede.nombre}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SedeDetallePage;
