import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useSedes } from '../hooks';
import { SedeCard, SedesFiltros, Paginacion } from '../components';
import { adminButtons } from '../../layout/adminTheme';

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

  const handleCrearNueva = () => {
    navigate('/admin/sedes/nueva');
  };

  const handleEliminar = (idSede: number) => {
    console.log('Eliminar sede:', idSede);
  };

  const limite = filtros.limit || 12;
  const mostrandoDesde = (pagina - 1) * limite + 1;
  const mostrandoHasta = Math.min(pagina * limite, total);

  return (
    <div className="space-y-5">
      <div className="admin-card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Gestion de sedes</p>
          <h1 className="text-2xl font-semibold text-[var(--text-main)]">Sedes deportivas</h1>
          <p className="text-sm text-[var(--muted)]">Filtros avanzados · verificacion · ocupacion</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">Total de sedes</p>
            <p className="text-2xl font-bold text-[var(--text-main)]">{total}</p>
          </div>
          <button onClick={handleCrearNueva} className={`${adminButtons.primary} whitespace-nowrap`}>
            <Plus size={18} />
            Nueva sede
          </button>
        </div>
      </div>

      <SedesFiltros filtros={filtros} onFiltrosChange={actualizarFiltros} onLimpiarFiltros={limpiarFiltros} />

      {error && (
        <div className="admin-card p-4 flex items-center gap-3 border border-[var(--danger)]/30 text-[var(--danger)]">
          <AlertCircle size={20} />
          <div>
            <p className="text-sm font-semibold">Error al cargar las sedes</p>
            <p className="text-xs">{error}</p>
          </div>
          <button onClick={recargar} className={`${adminButtons.ghost} ml-auto`}>
            Reintentar
          </button>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
            <p className="text-[var(--muted)]">Cargando sedes...</p>
          </div>
        ) : sedes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="text-[var(--muted)]" size={40} />
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--text-main)]">No se encontraron sedes</p>
              <p className="text-sm text-[var(--muted)]">
                {filtros.buscar || filtros.ciudad ? 'Ajusta los filtros de busqueda' : 'Comienza creando una nueva sede'}
              </p>
            </div>
            {(filtros.buscar || filtros.ciudad) && (
              <button onClick={limpiarFiltros} className={adminButtons.ghost}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
