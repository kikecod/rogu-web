import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { FiltrosUsuarios } from '../components/FiltrosUsuarios';
import { TablaUsuarios } from '../components/TablaUsuarios';
import { Paginacion } from '../components/Paginacion';
import { ROUTES } from '@/config/routes';
import type { Usuario } from '../../types';
import { adminButtons } from '../../layout/adminTheme';

const UsuariosListPage = () => {
  const navigate = useNavigate();
  const {
    usuarios,
    loading,
    error,
    total,
    paginas,
    filtros,
    cambiarPagina,
    buscar,
    filtrarPorRol,
    filtrarPorEstado,
    refrescar,
  } = useUsuarios();

  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;

    setEliminando(true);
    try {
      const { usuariosService } = await import('../services/usuarios.service');
      await usuariosService.eliminar(usuarioAEliminar.idUsuario, motivoBaja);
      setUsuarioAEliminar(null);
      setMotivoBaja('');
      refrescar();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al dar de baja al usuario');
    } finally {
      setEliminando(false);
    }
  };

  const limit = filtros.limit || 20;
  const mostrandoDesde = ((filtros.page || 1) - 1) * limit + 1;
  const mostrandoHasta = Math.min((filtros.page || 1) * limit, total);

  return (
    <div className="space-y-5">
      <div className="admin-card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Gestion de usuarios</p>
          <h1 className="text-2xl font-semibold text-[var(--text-main)]">Control total del sistema</h1>
          <p className="text-sm text-[var(--muted)]">Roles, estados, actividad reciente</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refrescar()} className={`${adminButtons.ghost} whitespace-nowrap`}>
            <RefreshCw size={16} />
            Refrescar
          </button>
          <button
            onClick={() => navigate(ROUTES.admin.usuariosNuevo)}
            className={`${adminButtons.primary} whitespace-nowrap`}
          >
            <UserPlus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="admin-card p-4">
          <p className="text-xs text-[var(--muted)]">Total usuarios</p>
          <p className="text-2xl font-semibold text-[var(--text-main)]">{total}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs text-[var(--muted)]">Mostrando</p>
          <p className="text-2xl font-semibold text-[var(--text-main)]">{usuarios.length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs text-[var(--muted)]">Pagina actual</p>
          <p className="text-2xl font-semibold text-[var(--text-main)]">{filtros.page}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs text-[var(--muted)]">Total paginas</p>
          <p className="text-2xl font-semibold text-[var(--text-main)]">{paginas}</p>
        </div>
      </div>

      <FiltrosUsuarios
        onBuscar={buscar}
        onFiltrarRol={filtrarPorRol}
        onFiltrarEstado={filtrarPorEstado}
        rolActual={filtros.rol}
        estadoActual={filtros.estado}
        busquedaActual={filtros.buscar}
      />

      {error && (
        <div className="admin-card p-4 border border-[var(--danger)]/40 text-[var(--danger)]">
          <p>{error}</p>
        </div>
      )}

      <TablaUsuarios usuarios={usuarios} onEliminar={setUsuarioAEliminar} loading={loading} />

      {!loading && usuarios.length > 0 && (
        <Paginacion
          paginaActual={filtros.page || 1}
          totalPaginas={paginas}
          onCambiarPagina={cambiarPagina}
          total={total}
          mostrandoDesde={mostrandoDesde}
          mostrandoHasta={mostrandoHasta}
        />
      )}

      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="admin-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">Confirmar baja de usuario</h3>
            <p className="text-sm text-[var(--muted)]">
              Estas seguro de dar de baja a{' '}
              <strong>
                {usuarioAEliminar.persona?.nombre} {usuarioAEliminar.persona?.apellidoPaterno}
              </strong>
              ?
            </p>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                Motivo de la baja (opcional)
              </label>
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                rows={3}
                placeholder="Describe el motivo..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setUsuarioAEliminar(null);
                  setMotivoBaja('');
                }}
                disabled={eliminando}
                className={`${adminButtons.muted} disabled:opacity-60`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className={`${adminButtons.primary} bg-[var(--danger)] hover:brightness-105 disabled:opacity-60`}
              >
                {eliminando ? 'Eliminando...' : 'Confirmar baja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosListPage;
