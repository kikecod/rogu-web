import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useSedes } from '../hooks';
import { SedeCard, SedesFiltros, Paginacion } from '../components';

const SedesListPage = () => {
  const navigate = useNavigate();
  const {
    sedes,
    loading,
    error,
    total,
    pagina,
    totalPaginas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    recargar,
  } = useSedes();

  const handleVerDetalle = (idSede: number) => {
    navigate(`/admin/sedes/${idSede}`);
  };

  const handleEditar = (idSede: number) => {
    navigate(`/admin/sedes/${idSede}/editar`);
  };

  const handleEliminar = (idSede: number) => {
    // TODO: Implementar modal de confirmación
    console.log('Eliminar sede:', idSede);
  };

  const handleCrearNueva = () => {
    navigate('/admin/sedes/nueva');
  };

  const limite = filtros.limit || 12;
  const mostrandoDesde = (pagina - 1) * limite + 1;
  const mostrandoHasta = Math.min(pagina * limite, total);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sedes</h1>
          <p className="text-gray-600 mt-2">
            Administra todas las sedes deportivas del sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total de sedes</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          <button
            onClick={handleCrearNueva}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Nueva Sede
          </button>
        </div>
      </div>

      {/* Filtros */}
      <SedesFiltros
        filtros={filtros}
        onFiltrosChange={actualizarFiltros}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Error al cargar las sedes</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={recargar}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de Sedes */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-500">Cargando sedes...</p>
          </div>
        ) : sedes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <AlertCircle className="text-gray-400" size={48} />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">No se encontraron sedes</p>
              <p className="text-gray-500 mt-1">
                {filtros.buscar || filtros.ciudad
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando una nueva sede'}
              </p>
            </div>
            {(filtros.buscar || filtros.ciudad) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {sedes.map((sede) => (
                <SedeCard
                  key={sede.idSede}
                  sede={sede}
                  onClick={() => handleVerDetalle(sede.idSede)}
                  onEdit={() => handleEditar(sede.idSede)}
                  onDelete={() => handleEliminar(sede.idSede)}
                />
              ))}
            </div>

            {/* Paginación */}
            <Paginacion
              paginaActual={pagina}
              totalPaginas={totalPaginas}
              onCambioPagina={cambiarPagina}
              total={total}
              mostrandoDesde={mostrandoDesde}
              mostrandoHasta={mostrandoHasta}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SedesListPage;

