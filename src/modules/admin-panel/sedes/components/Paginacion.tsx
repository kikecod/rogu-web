import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambioPagina: (pagina: number) => void;
  total?: number;
  mostrandoDesde?: number;
  mostrandoHasta?: number;
}

export const Paginacion = ({
  paginaActual,
  totalPaginas,
  onCambioPagina,
  total,
  mostrandoDesde,
  mostrandoHasta,
}: PaginacionProps) => {
  const generarNumerosPagina = () => {
    const numeros: (number | string)[] = [];
    const rango = 2; // Números a mostrar alrededor de la página actual

    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaActual - rango && i <= paginaActual + rango)
      ) {
        numeros.push(i);
      } else if (numeros[numeros.length - 1] !== '...') {
        numeros.push('...');
      }
    }

    return numeros;
  };

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
      {/* Información de resultados */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onCambioPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onCambioPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Texto de información */}
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{mostrandoDesde || 1}</span> a{' '}
            <span className="font-medium">{mostrandoHasta || total || 0}</span> de{' '}
            <span className="font-medium">{total || 0}</span> resultados
          </p>
        </div>

        {/* Controles de paginación */}
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Botón Anterior */}
            <button
              onClick={() => onCambioPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft size={20} />
            </button>

            {/* Números de página */}
            {generarNumerosPagina().map((numero, index) => {
              if (numero === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              const esActual = numero === paginaActual;

              return (
                <button
                  key={numero}
                  onClick={() => onCambioPagina(numero as number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    esActual
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {numero}
                </button>
              );
            })}

            {/* Botón Siguiente */}
            <button
              onClick={() => onCambioPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
