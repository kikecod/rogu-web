import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  total?: number;
  mostrandoDesde?: number;
  mostrandoHasta?: number;
}

export const Paginacion = ({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  total,
  mostrandoDesde,
  mostrandoHasta,
}: PaginacionProps) => {
  const generarNumeros = () => {
    const numeros: (number | string)[] = [];
    const rango = 2;
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaActual - rango && i <= paginaActual + rango)) {
        numeros.push(i);
      } else if (numeros[numeros.length - 1] !== '...') {
        numeros.push('...');
      }
    }
    return numeros;
  };

  if (totalPaginas <= 1) return null;

  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-2 rounded-input border border-border bg-white/80 text-text-main flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-2 rounded-input border border-border bg-white/80 text-text-main flex items-center gap-2 disabled:opacity-50"
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="text-sm text-muted">
        Mostrando <span className="font-semibold text-text-main">{mostrandoDesde || 1}</span> a{' '}
        <span className="font-semibold text-text-main">{mostrandoHasta || total || 0}</span> de{' '}
        <span className="font-semibold text-text-main">{total || 0}</span> resultados
      </div>

      <div className="flex items-center gap-1">
        {generarNumeros().map((num, index) =>
          num === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-xs font-semibold text-muted bg-white/80 rounded-lg border border-border"
            >
              ...
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onCambiarPagina(num as number)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                num === paginaActual
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-text-main border-primary/40'
                  : 'bg-white/80 text-muted border-border hover:text-text-main'
              }`}
            >
              {num}
            </button>
          )
        )}
      </div>
    </div>
  );
};
