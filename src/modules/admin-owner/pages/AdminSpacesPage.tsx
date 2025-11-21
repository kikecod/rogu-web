// src/modules/admin-owner/pages/AdminSpacesPage.tsx

import React, { useState } from 'react';
import VenueManagement from '@/venues/components/VenueManagement';
import FieldManagement from '@/fields/components/FieldManagement';
import ProtectedRoute from '@/core/routing/ProtectedRoute';
import { useAuth } from '@/auth/hooks/useAuth';
import AnalyticsDashboardPage from '../../analytics/pages/AnalyticsDashboardPage';
import CanchaAnalyticsPage from '../../analytics/pages/CanchaAnalyticsPage';
import ResenasPage from '../../analytics/pages/ResenasPage';
import type { ApiSede } from '@/venues/types/venue.types';

// Sede compatible con VenueManagement
interface Sede extends Partial<ApiSede> {
  idSede: number;
  nombre: string;
  descripcion: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
  direccion?: string;
  latitud?: string;
  longitud?: string;
  ciudad?: string;
  canchas?: any[];
}

type ViewMode = 'sedes' | 'canchas' | 'analytics' | 'cancha-analytics' | 'resenas';

const AdminSpacesPage: React.FC = () => {
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