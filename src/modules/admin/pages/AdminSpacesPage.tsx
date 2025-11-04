import React, { useState } from 'react';
import { ArrowLeft, BarChart3, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VenueManagement from '@/venues/components/VenueManagement';
import FieldManagement from '@/fields/components/FieldManagement';
import ProtectedRoute from '@/core/routing/ProtectedRoute';
import { useAuth } from '@/auth/hooks/useAuth';
import AnalyticsDashboardPage from '../../analytics/pages/AnalyticsDashboardPage';
import CanchaAnalyticsPage from '../../analytics/pages/CanchaAnalyticsPage';
import ResenasPage from '../../analytics/pages/ResenasPage';

interface Sede {
  idSede: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: string;
  longitud: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
}

type ViewMode = 'sedes' | 'canchas' | 'analytics' | 'cancha-analytics' | 'resenas';

const AdminSpacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sedes');
  const [selectedCanchaId, setSelectedCanchaId] = useState<number | null>(null);
  const { user } = useAuth();

  // Manejar selección de sede para gestionar canchas
  const handleSedeSelect = (sede: Sede) => {
    setSelectedSede(sede);
    setViewMode('canchas');
  };

  // Volver a la gestión de sedes
  const handleBackToSedes = () => {
    setSelectedSede(null);
    setViewMode('sedes');
    setSelectedCanchaId(null);
  };

  // Cambiar a vista de analytics
  const handleShowAnalytics = () => {
    setSelectedCanchaId(null); // Reset cancha selection
    setViewMode('analytics');
  };

  // Cambiar a vista de reseñas
  const handleShowResenas = () => {
    setSelectedCanchaId(null); // Reset cancha selection
    setViewMode('resenas');
  };

  // Ver analytics de una cancha específica
  const handleViewCanchaAnalytics = (idCancha: number) => {
    setSelectedCanchaId(idCancha);
    setViewMode('cancha-analytics');
  };

  return (
    <ProtectedRoute 
      requiredRoles={['DUENIO', 'ADMIN']} 
      showUnauthorized={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                    Administración de Espacios Deportivos
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Bienvenido, {user?.correo || 'Usuario'}. Gestiona tus espacios deportivos desde aquí.
                  </p>
                  {user?.roles && (
                    <p className="mt-1 text-xs text-blue-600">
                      Roles: {user.roles.join(', ')}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  {viewMode !== 'sedes' && (
                    <button
                      onClick={handleBackToSedes}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Mis Sedes
                    </button>
                  )}
                  {(viewMode === 'sedes' || viewMode === 'canchas' || viewMode === 'analytics' || viewMode === 'resenas' || viewMode === 'cancha-analytics') && (
                    <>
                      <button
                        onClick={handleShowAnalytics}
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                          viewMode === 'analytics'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={handleShowResenas}
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                          viewMode === 'resenas'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Reseñas
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Componente principal según el modo de vista */}
          {user?.idPersona ? (
            <>
              {viewMode === 'sedes' && (
                <VenueManagement 
                  idPersonaD={user.idPersona} 
                  onSedeSelect={handleSedeSelect}
                />
              )}
              
              {viewMode === 'canchas' && selectedSede && (
                <FieldManagement 
                  sede={selectedSede}
                  onBack={handleBackToSedes}
                />
              )}

              {viewMode === 'analytics' && (
                <AnalyticsDashboardPage 
                  key={`analytics-${selectedSede?.idSede || 'all'}`}
                  idPersonaD={user.idPersona}
                  idSede={selectedSede?.idSede}
                  onViewCanchaAnalytics={handleViewCanchaAnalytics}
                />
              )}

              {viewMode === 'cancha-analytics' && selectedCanchaId && (
                <CanchaAnalyticsPage 
                  key={`cancha-${selectedCanchaId}`}
                  idCancha={selectedCanchaId}
                  onBack={handleBackToSedes}
                />
              )}

              {viewMode === 'resenas' && (
                <ResenasPage 
                  key={`resenas-${selectedSede?.idSede || 'all'}`}
                  idPersonaD={user.idPersona}
                  idSede={selectedSede?.idSede}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-red-600 text-lg">
                Error: No se pudo obtener la información del usuario.
              </div>
              <p className="text-gray-600 mt-2">
                Por favor, inicia sesión nuevamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSpacesPage;