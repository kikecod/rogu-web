import { Search, Filter, X, Shield, Users, Clock3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TipoRol, EstadoUsuario } from '../../types';

interface FiltrosUsuariosProps {
  onBuscar: (termino: string) => void;
  onFiltrarRol: (rol?: TipoRol) => void;
  onFiltrarEstado: (estado?: EstadoUsuario) => void;
  rolActual?: TipoRol;
  estadoActual?: EstadoUsuario;
  busquedaActual?: string;
}

const rolesChips: Array<{ value: TipoRol; label: string; icon: any }> = [
  { value: 'CLIENTE', label: 'Cliente', icon: Users },
  { value: 'DUENIO', label: 'Dueno', icon: Shield },
  { value: 'ADMIN', label: 'Admin', icon: Shield },
  { value: 'CONTROLADOR', label: 'Controlador', icon: Clock3 },
];

const estadosChips: Array<{ value: EstadoUsuario; label: string }> = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'BLOQUEADO', label: 'Suspendido' },
];

export const FiltrosUsuarios = ({
  onBuscar,
  onFiltrarRol,
  onFiltrarEstado,
  rolActual,
  estadoActual,
  busquedaActual,
}: FiltrosUsuariosProps) => {
  const [termino, setTermino] = useState(busquedaActual || '');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const hayFiltrosActivos = useMemo(() => rolActual || estadoActual || busquedaActual, [
    rolActual,
    estadoActual,
    busquedaActual,
  ]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar(termino);
  };

  const limpiarFiltros = () => {
    onFiltrarRol(undefined);
    onFiltrarEstado(undefined);
    setTermino('');
    onBuscar('');
  };

  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-4 space-y-4">
      <form onSubmit={handleBuscar} className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Buscar por nombre, correo, usuario o CI"
              className="w-full pl-10 pr-10 py-2.5 rounded-input border border-border bg-white/80 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
            {termino && (
              <button
                type="button"
                onClick={() => {
                  setTermino('');
                  onBuscar('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-main"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="px-4 py-2 rounded-input bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-soft whitespace-nowrap">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setMostrarFiltros((prev) => !prev)}
              className="px-3 py-2 rounded-input border border-border bg-white/80 text-text-main flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>
      </form>

      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Rol</p>
            <div className="flex flex-wrap gap-2">
              {rolesChips.map((rol) => {
                const Icon = rol.icon;
                const active = rolActual === rol.value;
                return (
                  <button
                    key={rol.value}
                    type="button"
                    onClick={() => onFiltrarRol(active ? undefined : rol.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border border-white/60 bg-white/60 backdrop-blur transition ${active ? 'ring-2 ring-primary text-text-main' : 'text-muted'}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={14} />
                      {rol.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Estado</p>
            <div className="flex flex-wrap gap-2">
              {estadosChips.map((estado) => {
                const active = estadoActual === estado.value;
                return (
                  <button
                    key={estado.value}
                    type="button"
                    onClick={() => onFiltrarEstado(active ? undefined : estado.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border border-white/60 bg-white/60 backdrop-blur transition ${active ? 'ring-2 ring-secondary text-text-main' : 'text-muted'}`}
                  >
                    {estado.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {hayFiltrosActivos && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted">Filtros activos:</span>
          {rolActual && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold border border-border bg-white/80 text-text-main flex items-center gap-1">
              Rol: {rolActual}
              <button onClick={() => onFiltrarRol(undefined)} className="text-muted hover:text-text-main">
                <X size={12} />
              </button>
            </span>
          )}
          {estadoActual && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold border border-border bg-white/80 text-text-main flex items-center gap-1">
              Estado: {estadoActual}
              <button onClick={() => onFiltrarEstado(undefined)} className="text-muted hover:text-text-main">
                <X size={12} />
              </button>
            </span>
          )}
          {busquedaActual && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold border border-border bg-white/80 text-text-main flex items-center gap-1">
              Busqueda: "{busquedaActual}"
              <button
                onClick={() => {
                  setTermino('');
                  onBuscar('');
                }}
                className="text-muted hover:text-text-main"
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={limpiarFiltros} className="text-xs px-3 py-2 rounded-input border border-border bg-white/80 text-danger hover:bg-danger/10">
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
