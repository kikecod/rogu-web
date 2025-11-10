import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Clock, HelpCircle, X } from 'lucide-react';
import { getRecoverySuggestions, formatErrorMessage } from '../lib/errorHandler';
import type { ErrorState } from '../lib/errorHandler';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showSuggestions?: boolean;
  compact?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  showSuggestions = true,
  compact = false
}) => {
  if (!error.hasError) return null;

  const suggestions = showSuggestions ? getRecoverySuggestions(error) : [];
  const formattedMessage = formatErrorMessage(error);

  // Iconos según el tipo de error
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi className="w-6 h-6 text-red-500" />;
      case 'timeout':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'validation':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'server':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <HelpCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  // Estilo según el tipo de error
  const getErrorStyle = () => {
    switch (error.type) {
      case 'network':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'timeout':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'validation':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center p-3 border rounded-md ${getErrorStyle()} ${className}`}>
        <div className="flex-shrink-0 mr-3">
          {getErrorIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {formattedMessage}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium hover:underline focus:outline-none"
            >
              Reintentar
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 ${getErrorStyle()} ${className}`}>
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            {getErrorIcon()}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">
              {error.type === 'network' ? 'Error de conexión' :
               error.type === 'timeout' ? 'Tiempo de espera agotado' :
               error.type === 'validation' ? 'Datos inválidos' :
               error.type === 'server' ? 'Error del servidor' :
               'Error inesperado'}
            </h3>
            
            <p className="mt-1 text-sm">
              {formattedMessage}
            </p>
            
            {error.retryCount > 0 && (
              <p className="mt-1 text-xs opacity-75">
                Intentos fallidos: {error.retryCount}
              </p>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* DETALLES DE ERROR */}
      {error.details && error.details.length > 0 && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Detalles del error:</h4>
          <div className="space-y-1">
            {error.details.map((detail, index) => (
              <div key={index} className="text-sm">
                {detail.field && (
                  <span className="font-medium">{detail.field}: </span>
                )}
                <span>{detail.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUGERENCIAS DE RECUPERACIÓN */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Posibles soluciones:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ACCIONES */}
      <div className="mt-6 flex items-center gap-3">
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;