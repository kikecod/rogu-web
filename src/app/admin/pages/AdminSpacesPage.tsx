import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SedeManagement from '../../../features/sedes/components/SedeManagement';
import CanchaManagement from '../../../features/canchas/components/CanchaManagement';
import ProtectedRoute from '../../../features/auth/components/ProtectedRoute';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { ROUTE_PATHS } from '../../../constants';

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

const AdminSpacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const { user } = useAuth();

  // Manejar selección de sede para gestionar canchas
  const handleSedeSelect = (sede: Sede) => {
    setSelectedSede(sede);
  };

  // Volver a la gestión de sedes
  const handleBackToSedes = () => {
    setSelectedSede(null);
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
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <button
                    onClick={() => navigate(ROUTE_PATHS.HOME)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Componente principal de gestión */}
          {user?.id_persona ? (
            selectedSede ? (
              <CanchaManagement 
                sede={selectedSede}
                onBack={handleBackToSedes}
              />
            ) : (
              <SedeManagement 
                id_personaD={user.id_persona} 
                onSedeSelect={handleSedeSelect}
              />
            )
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

