import React, { useState } from 'react';
import { LayoutDashboard, Building2, Star } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import VenueManagement from '@/venues/components/VenueManagement';
import FieldManagement from '@/fields/components/FieldManagement';
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

type TabType = 'dashboard' | 'espacios' | 'resenas';
type ViewMode = 'sedes' | 'canchas' | 'cancha-analytics';

const OwnerModePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('espacios');
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

  // Resetear vista al cambiar de pestaña
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedSede(null);
    setViewMode('sedes');
    setSelectedCanchaId(null);
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'espacios' as TabType,
      label: 'Gestión de Espacios',
      icon: Building2,
    },
    {
      id: 'resenas' as TabType,
      label: 'Reseñas',
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con pestañas */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">Modo Dueño</h1>
          </div>
          
          {/* Pestañas */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                    ${isActive 
                      ? 'border-blue-600 text-blue-700 bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.idPersona ? (
          <>
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <>
                {viewMode === 'cancha-analytics' && selectedCanchaId ? (
                  <CanchaAnalyticsPage 
                    key={`cancha-${selectedCanchaId}`}
                    idCancha={selectedCanchaId}
                    onBack={handleBackToSedes}
                  />
                ) : (
                  <AnalyticsDashboardPage 
                    key={`analytics-${selectedSede?.idSede || 'all'}`}
                    idPersonaD={user.idPersona}
                    idSede={selectedSede?.idSede}
                    onViewCanchaAnalytics={handleViewCanchaAnalytics}
                  />
                )}
              </>
            )}

            {/* Tab: Gestión de Espacios */}
            {activeTab === 'espacios' && (
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
              </>
            )}

            {/* Tab: Reseñas */}
            {activeTab === 'resenas' && (
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
  );
};

export default OwnerModePage;
