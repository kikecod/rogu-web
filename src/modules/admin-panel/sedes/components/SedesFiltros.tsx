import { Search, X, MapPin, ShieldCheck } from 'lucide-react';
import type { FiltrosSedes } from '../types';
import { adminButtons, adminChips } from '../../layout/adminTheme';

interface SedesFiltrosProps {
  filtros: FiltrosSedes;
  onFiltrosChange: (filtros: FiltrosSedes) => void;
  onLimpiarFiltros: () => void;
}

export const SedesFiltros = ({ filtros, onFiltrosChange, onLimpiarFiltros }: SedesFiltrosProps) => {
  const handleChange = (key: keyof FiltrosSedes, value: any) => {
    onFiltrosChange({ ...filtros, [key]: value });
  };

  const tieneFiltrosActivos = () =>
    filtros.buscar ||
    filtros.ciudad ||
    filtros.estado ||
    filtros.verificada !== undefined ||
    filtros.activa !== undefined ||
    filtros.idDuenio ||
    filtros.calificacionMin !== undefined;

  return (
    <div className="admin-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
          <input
            type="text"
            placeholder="Buscar sedes por nombre..."
            value={filtros.buscar || ''}
            onChange={(e) => handleChange('buscar', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          {filtros.buscar && (
            <button
              type="button"
              onClick={() => handleChange('buscar', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={onLimpiarFiltros} className={`${adminButtons.muted} whitespace-nowrap`}>
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Ciudad</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input
              type="text"
              placeholder="Ciudad..."
              value={filtros.ciudad || ''}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Estado</label>
          <select
            value={filtros.activa === undefined ? '' : filtros.activa ? 'true' : 'false'}
            onChange={(e) => handleChange('activa', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Verificacion</label>
          <select
            value={filtros.verificada === undefined ? '' : filtros.verificada ? 'true' : 'false'}
            onChange={(e) =>
              handleChange('verificada', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="">Todas</option>
            <option value="true">Verificadas</option>
            <option value="false">No verificadas</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">ID Dueño</label>
          <input
            type="number"
            placeholder="ID"
            value={filtros.idDuenio || ''}
            onChange={(e) => handleChange('idDuenio', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Rating minimo</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filtros.calificacionMin ?? 0}
              onChange={(e) => handleChange('calificacionMin', Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-[var(--text-main)]">{filtros.calificacionMin ?? 0}</span>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Ordenar por</label>
          <select
            value={filtros.ordenarPor || ''}
            onChange={(e) => handleChange('ordenarPor', e.target.value as FiltrosSedes['ordenarPor'])}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="">Defecto</option>
            <option value="nombre">Nombre</option>
            <option value="fecha">Fecha</option>
            <option value="calificacion">Calificacion</option>
            <option value="reservas">Reservas</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Direccion</label>
          <select
            value={filtros.ordenDireccion || ''}
            onChange={(e) => handleChange('ordenDireccion', e.target.value as FiltrosSedes['ordenDireccion'])}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white/80 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="">Defecto</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      {tieneFiltrosActivos() && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--muted)]">Filtros activos:</span>
          {filtros.ciudad && (
            <span className={`${adminChips.glass} text-xs font-semibold`}>
              Ciudad: {filtros.ciudad}
              <button onClick={() => handleChange('ciudad', '')} className="ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {filtros.activa !== undefined && (
            <span className={`${adminChips.glass} text-xs font-semibold`}>
              Estado: {filtros.activa ? 'Activa' : 'Inactiva'}
              <button onClick={() => handleChange('activa', undefined)} className="ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {filtros.verificada !== undefined && (
            <span className={`${adminChips.glass} text-xs font-semibold`}>
              Verificada: {filtros.verificada ? 'Si' : 'No'}
              <button onClick={() => handleChange('verificada', undefined)} className="ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {filtros.calificacionMin !== undefined && (
            <span className={`${adminChips.glass} text-xs font-semibold`}>
              Rating ≥ {filtros.calificacionMin}
              <button onClick={() => handleChange('calificacionMin', undefined)} className="ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={onLimpiarFiltros} className={`${adminButtons.ghost} text-xs`}>
            <ShieldCheck size={14} />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
