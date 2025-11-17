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
  const paginasVisibles = 5;
  const mitad = Math.floor(paginasVisibles / 2);

  let inicio = Math.max(1, paginaActual - mitad);
  let fin = Math.min(totalPaginas, inicio + paginasVisibles - 1);

  if (fin - inicio < paginasVisibles - 1) {
    inicio = Math.max(1, fin - paginasVisibles + 1);
  }

  const paginas = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          {total !== undefined && mostrandoDesde !== undefined && mostrandoHasta !== undefined ? (
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{mostrandoDesde}</span> a{' '}
              <span className="font-medium">{mostrandoHasta}</span> de{' '}
              <span className="font-medium">{total}</span> resultados
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{paginaActual}</span> de{' '}
              <span className="font-medium">{totalPaginas}</span>
            </p>
          )}
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onCambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            {inicio > 1 && (
              <>
                <button
                  onClick={() => onCambiarPagina(1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
                {inicio > 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
              </>
            )}
            {paginas.map((pagina) => (
              <button
                key={pagina}
                onClick={() => onCambiarPagina(pagina)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pagina === paginaActual
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pagina}
              </button>
            ))}
            {fin < totalPaginas && (
              <>
                {fin < totalPaginas - 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                <button
                  onClick={() => onCambiarPagina(totalPaginas)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {totalPaginas}
                </button>
              </>
            )}
            <button
              onClick={() => onCambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
