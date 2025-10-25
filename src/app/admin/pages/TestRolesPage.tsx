import React from 'react';
import ProtectedRoute from '../../../features/auth/components/ProtectedRoute';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { ROUTE_PATHS } from '../../../constants';
import { ArrowLeft, Shield, Users, Settings, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestRolesPage: React.FC = () => {
  const { user, isDuenio, isAdmin, isCliente } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Prueba de Roles
              </h1>
              <p className="text-gray-600 mt-1">
                Esta página demuestra el control de acceso basado en roles
              </p>
            </div>
            <button
              onClick={() => navigate(ROUTE_PATHS.HOME)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </button>
          </div>
        </div>

        {/* Información del usuario actual */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tu información de usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Correo electrónico:</p>
              <p className="font-medium">{user?.correo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roles asignados:</p>
              <p className="font-medium">
                {user?.roles?.join(', ') || 'Ninguno'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID de Usuario:</p>
              <p className="font-medium">{user?.id_usuario}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID de Persona:</p>
              <p className="font-medium">{user?.id_persona}</p>
            </div>
          </div>
        </div>

        {/* Secciones por rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección para CLIENTE */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sección de Cliente
              </h3>
            </div>
            {isCliente() ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">✅ Tienes acceso como CLIENTE</span>
                </div>
                <p className="text-gray-600">
                  Como cliente puedes:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Ver y reservar espacios deportivos</li>
                  <li>Gestionar tus reservas</li>
                  <li>Calificar canchas</li>
                  <li>Ver tu historial de reservas</li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <Eye className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">❌ No tienes rol de CLIENTE</span>
              </div>
            )}
          </div>

          {/* Sección para DUENIO */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sección de Dueño
              </h3>
            </div>
            {isDuenio() ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">✅ Tienes acceso como DUEÑO</span>
                </div>
                <p className="text-gray-600">
                  Como dueño puedes:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Gestionar tus espacios deportivos</li>
                  <li>Crear y editar canchas</li>
                  <li>Ver reportes de reservas</li>
                  <li>Administrar precios y horarios</li>
                </ul>
                <button
                  onClick={() => navigate(ROUTE_PATHS.ADMIN_SPACES)}
                  className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ir al Panel de Administración
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <Eye className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">❌ No tienes rol de DUEÑO</span>
                </div>
                <button
                  onClick={() => navigate(ROUTE_PATHS.HOST)}
                  className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Convertirme en Dueño
                </button>
              </div>
            )}
          </div>

          {/* Sección para ADMIN */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sección de Administrador
              </h3>
            </div>
            {isAdmin() ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">✅ Tienes acceso como ADMIN</span>
                </div>
                <p className="text-gray-600">
                  Como administrador puedes:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Gestionar todos los usuarios</li>
                  <li>Moderar contenido y reportes</li>
                  <li>Ver estadísticas del sistema</li>
                  <li>Administrar configuraciones globales</li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <Eye className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">❌ No tienes rol de ADMIN</span>
              </div>
            )}
          </div>

          {/* Página protegida de ejemplo */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Ejemplos de Protección
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-3">
                Diferentes niveles de acceso:
              </p>
              
              {/* Solo DUENIO */}
              <ProtectedRoute 
                requiredRoles={['DUENIO']} 
                showUnauthorized={false}
              >
                <div className="p-2 bg-green-100 rounded text-green-800 text-sm">
                  🔐 Contenido solo para DUEÑOS
                </div>
              </ProtectedRoute>

              {/* Solo ADMIN */}
              <ProtectedRoute 
                requiredRoles={['ADMIN']} 
                showUnauthorized={false}
              >
                <div className="p-2 bg-purple-100 rounded text-purple-800 text-sm">
                  🔐 Contenido solo para ADMINS
                </div>
              </ProtectedRoute>

              {/* DUENIO o ADMIN */}
              <ProtectedRoute 
                requiredRoles={['DUENIO', 'ADMIN']} 
                showUnauthorized={false}
              >
                <div className="p-2 bg-blue-100 rounded text-blue-800 text-sm">
                  🔐 Contenido para DUEÑOS o ADMINS
                </div>
              </ProtectedRoute>

              {/* Contenido siempre visible */}
              <div className="p-2 bg-gray-100 rounded text-gray-800 text-sm">
                👀 Contenido público (siempre visible)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRolesPage;



