// File: components/FavoriteFilters.tsx
import React, { useEffect, useState } from 'react';
import { disciplinasService, type DisciplinaItem } from '../services/disciplinasService';

export interface FavoriteFilterState {
  disciplinas?: number[]; // ids de disciplinas seleccionadas
  precioMin?: number;
  precioMax?: number;
  match?: 'any' | 'all'; // semántica de coincidencia
  // Deprecated: superficie textual
  superficie?: string;
}

interface Props {
  onChange: (filters: FavoriteFilterState) => void;
}

export const FavoriteFilters: React.FC<Props> = ({ onChange }) => {
  const [superficie] = useState(''); // deprecated (retained for compatibility but hidden)
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [disciplinas, setDisciplinas] = useState<number[]>([]);
  const [match, setMatch] = useState<'any' | 'all'>('any');
  const [allDisciplinas, setAllDisciplinas] = useState<DisciplinaItem[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingDisc(true);
        const list = await disciplinasService.list();
        if (mounted) setAllDisciplinas(list);
      } catch (e) {
        console.error('Error cargando disciplinas', e);
      } finally {
        setLoadingDisc(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const toggleDisciplina = (id: number) => {
    setDisciplinas(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const apply = () => {
    onChange({
      disciplinas: disciplinas.length ? disciplinas : undefined,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      match: match,
      superficie: superficie || undefined,
    });
  };

  const handleToggleMatch = (value: 'any' | 'all') => {
    setMatch(value);
    // auto-aplicar para feedback rápido
    onChange({
      disciplinas: disciplinas.length ? disciplinas : undefined,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      match: value,
      superficie: superficie || undefined,
    });
  };

  return (
    <details className="group w-full">
      <summary className="list-none cursor-pointer select-none">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300">
          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
            Filtros
          </div>
          <div className="text-xs text-gray-500">
            {disciplinas.length} disciplinas{precioMin || precioMax ? ` · Bs ${precioMin || 0}-${precioMax || '∞'}` : ''}{' '}
            {match === 'all' && disciplinas.length > 1 ? '· Todas' : ''}
          </div>
        </div>
      </summary>
      <div className="mt-3 flex flex-wrap gap-3 items-end max-w-xl">
      {/* Disciplinas */}
      <div className="flex flex-col flex-1 min-w-[260px]">
        <label className="text-[11px] font-medium text-gray-500 mb-1">Disciplinas</label>
        <div className="mb-2 relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar disciplina..."
            className="w-full px-9 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm outline-none transition placeholder:text-gray-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-300/60"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-auto pr-1">
          {(loadingDisc ? [] : allDisciplinas.filter(d => d.nombre.toLowerCase().includes(search.toLowerCase()))).map(d => {
            const active = disciplinas.includes(d.idDisciplina);
            return (
              <button
                key={d.idDisciplina}
                type="button"
                onClick={() => toggleDisciplina(d.idDisciplina)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {d.nombre}
              </button>
            );
          })}
        </div>
        {disciplinas.length > 0 && (
          <div className="mt-2 text-[11px] text-gray-500">{disciplinas.length} seleccionada(s)</div>
        )}
      </div>

      {/* Precio min */}
      <div className="flex flex-col w-28">
        <label className="text-[11px] font-medium text-gray-500 mb-1">Precio min</label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">Bs</span>
          <input
            value={precioMin}
            onChange={e => setPrecioMin(e.target.value)}
            type="number"
            min={0}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-300/60"
          />
        </div>
      </div>

      {/* Precio max */}
      <div className="flex flex-col w-28">
        <label className="text-[11px] font-medium text-gray-500 mb-1">Precio max</label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">Bs</span>
          <input
            value={precioMax}
            onChange={e => setPrecioMax(e.target.value)}
            type="number"
            min={0}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-300/60"
          />
        </div>
      </div>

      {/* Match selector */}
      <div className="flex flex-col w-40">
        <label className="text-[11px] font-medium text-gray-500 mb-1">Coincidencia</label>
        <div className="flex gap-3 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="match"
              value="any"
              checked={match === 'any'}
              onChange={() => handleToggleMatch('any')}
              className="accent-rose-500"
            />
            Cualquiera
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="match"
              value="all"
              checked={match === 'all'}
              onChange={() => handleToggleMatch('all')}
              className="accent-rose-500"
            />
            Todas
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={apply}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium shadow-sm transition hover:from-rose-600 hover:to-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:ring-offset-2"
      >
        Aplicar
      </button>
      </div>
    </details>
  );
};

export default FavoriteFilters;
