import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Roles requeridos (debe tener al menos uno)
  requireAllRoles?: string[]; // Roles requeridos (debe tener todos)
  redirectTo?: string; // Ruta de redirección personalizada
  showUnauthorized?: boolean; // Mostrar mensaje de no autorizado en lugar de redirigir
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAllRoles = [],
  redirectTo = '/',
  showUnauthorized = false,
}) => {
  const { isLoggedIn, isLoading, hasAnyRole, hasAllRoles, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está logueado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar roles requeridos
  const hasRequiredRoles = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
  const hasAllRequiredRoles = requireAllRoles.length === 0 || hasAllRoles(requireAllRoles);

  const isAuthorized = hasRequiredRoles && hasAllRequiredRoles;

  // Si no tiene los roles requeridos
  if (!isAuthorized) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceso No Autorizado
              </h2>
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Usuario:</strong> {user?.correo}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Roles actuales:</strong> {user?.roles?.join(', ') || 'Ninguno'}
                </p>
                {requiredRoles.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Roles requeridos (cualquiera):</strong> {requiredRoles.join(', ')}
                  </p>
                )}
                {requireAllRoles.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <strong>Roles requeridos (todos):</strong> {requireAllRoles.join(', ')}
                  </p>
                )}
              </div>
              <p className="text-gray-600 mb-6">
                No tienes los permisos necesarios para acceder a esta página.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Si tiene los roles requeridos, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
