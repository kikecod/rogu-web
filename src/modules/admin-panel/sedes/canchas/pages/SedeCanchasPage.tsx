import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSedeDetalle } from '../../hooks/useSedeDetalle';
import CanchaCard from '../components/CanchaCard';
import { canchasService } from '../services/canchas.service';
import { useCanchasDeSede } from '../hooks/useCanchasDeSede';
import { ROUTES } from '@/config/routes';

const SedeCanchasPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idSede = Number(id);
  const { sede } = useSedeDetalle(idSede);
  const {
    canchas,
    loading,
    error,
    total,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
  } = useCanchasDeSede(idSede);

  const [formFilters, setFormFilters] = useState({
    deporte: '',
    estado: '',
    precioMin: '',
    cubierta: false,
    disponible: false,
  });

  const filtrosActivos = useMemo(
    () =>
      Object.values(formFilters).some(
        (value) =>
          value !== undefined &&
          value !== '' &&
          (typeof value !== 'boolean' || value === true)
      ),
    [formFilters]
  );

  const handleCrear = () => {
    if (!isNaN(idSede)) {
      navigate(ROUTES.admin.sedesCanchasCrear(idSede));
    }
  };

  const handleVerDetalle = (idCancha: number) => {
    navigate(ROUTES.admin.sedeCanchaDetalle(idSede, idCancha));
  };

  const handleEditar = (idCancha: number) => {
    navigate(ROUTES.admin.sedeCanchaEditar(idSede, idCancha));
  };

  const handleEliminar = async (idCancha: number) => {
    const motivo = window.prompt('Motivo de eliminación (obligatorio)');
    if (!motivo) return;

    try {
      await canchasService.eliminar(idCancha, motivo);
      alert('Cancha eliminada correctamente');
      recargar();
    } catch (err: any) {
      console.error('Error eliminando cancha:', err);
      alert(err?.message || 'No se pudo eliminar la cancha');
    }
  };

  const handleLimpiarFiltros = () => {
    setFormFilters({
      deporte: '',
      estado: '',
      precioMin: '',
      cubierta: false,
      disponible: false,
    });
    limpiarFiltros();
  };

  const handleAplicarFiltros = () => {
    actualizarFiltros({
      deporte: formFilters.deporte || undefined,
      estado: formFilters.estado || undefined,
      precioMin: formFilters.precioMin ? Number(formFilters.precioMin) : undefined,
      cubierta: formFilters.cubierta ? true : undefined,
      disponible: formFilters.disponible ? true : undefined,
    });
  };

  const estadoOptions = ['Disponible', 'Reservada', 'Mantenimiento'];

  return (
    <div className="space-y-6 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">Sede</p>
              <h1 className="text-3xl font-semibold text-gray-900">{sede?.nombre || 'Canchas de sede'}</h1>
              <p className="text-sm text-gray-500">
                {sede?.direccion || sede?.city || 'Detalle general de las canchas deportivas'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate(ROUTES.admin.sedes)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span>←</span> Volver
              </button>
          <button
            onClick={recargar}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Recargar
          </button>
          <button
            onClick={handleCrear}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Nueva cancha
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-1 text-sm text-gray-600">
            <span>Filtrar por deporte</span>
            <input
              value={formFilters.deporte}
              onChange={(e) =>
                setFormFilters((prev) => ({ ...prev, deporte: e.target.value }))
              }
              placeholder="Ej. Fútbol"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>Estado</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 focus:border-blue-500 focus:outline-none"
              value={formFilters.estado}
              onChange={(e) =>
                setFormFilters((prev) => ({ ...prev, estado: e.target.value }))
              }
            >
              <option value="">Todos</option>
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>Precio mínimo</span>
            <input
              type="number"
              min={0}
              value={formFilters.precioMin}
              onChange={(e) =>
                setFormFilters((prev) => ({ ...prev, precioMin: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <input
              type="checkbox"
              checked={formFilters.cubierta}
              onChange={(e) =>
                setFormFilters((prev) => ({ ...prev, cubierta: e.target.checked }))
              }
            />
            Canchas techadas
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formFilters.disponible}
              onChange={(e) =>
                setFormFilters((prev) => ({ ...prev, disponible: e.target.checked }))
              }
            />
            Solo disponibles
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAplicarFiltros}
              disabled={!filtrosActivos}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar filtros
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <p className="text-sm text-gray-500">
            {total} canchas encontradas
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Mostrando {canchas.length}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-sm text-red-600">
            <AlertCircle size={28} />
            <p>No se pudieron cargar las canchas</p>
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={recargar}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
            >
              Reintentar
            </button>
          </div>
        ) : canchas.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-sm text-gray-600">
            <p>No hay canchas registradas para esta sede</p>
            <p className="text-xs text-gray-400">
              Puedes crear una nueva cancha para que aparezca en el sistema
            </p>
            <button
              onClick={handleCrear}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Crear cancha
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {canchas.map((cancha) => (
              <CanchaCard
                key={cancha.idCancha}
                cancha={cancha}
                onView={() => handleVerDetalle(cancha.idCancha)}
                onEdit={() => handleEditar(cancha.idCancha)}
                onDelete={() => handleEliminar(cancha.idCancha)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SedeCanchasPage;
