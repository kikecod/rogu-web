import React, { useState, useEffect } from 'react';
import { Plus, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ApiSede } from '../types/venue.types';
import { ROUTES } from '@/config/routes';
import { SedePhotoManagement } from '@/admin-panel/sedes/components';
import VenueManagementCard from './VenueManagementCard';

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
  verificada?: boolean;
  direccion?: string;
  latitud?: string;
  longitud?: string;
  ciudad?: string;
  canchas?: any[];
  fotos?: { urlFoto: string }[];
  fotoPrincipal?: string;
}

interface SedeManagementProps {
  idPersonaD: number;
}

const SedeManagement: React.FC<SedeManagementProps> = ({ idPersonaD }) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  const [photoManagementOpen, setPhotoManagementOpen] = useState(false);
  const [selectedSedeForPhotos, setSelectedSedeForPhotos] = useState<Sede | null>(null);

  const navigate = useNavigate();

  const loadSedes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/duenio/${idPersonaD}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const allSedes = await response.json();
        const mySedes = allSedes.filter((sede: any) => sede.idPersonaD === idPersonaD);

        // Load photos for each sede
        const sedesWithPhotos = await Promise.all(
          mySedes.map(async (sede: any) => {
            try {
              const detailResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return {
                  ...sede,
                  fotos: detailData.sede?.fotos || [],
                  fotoPrincipal: detailData.sede?.fotoPrincipal
                };
              }
            } catch (error) {
              console.error(`Error loading photos for sede ${sede.idSede}:`, error);
            }
            return sede;
          })
        );

        console.log('📸 Sedes with photos loaded:', sedesWithPhotos);
        setSedes(sedesWithPhotos);
      }
    } catch (error) {
      console.error('Error loading sedes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSedes();
  }, [idPersonaD]);



  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Sedes</h2>
          <p className="text-gray-600">Gestiona tus espacios deportivos</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.owner.createVenue)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sede
        </button>
      </div>

      {sedes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes sedes</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera sede deportiva.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(ROUTES.owner.createVenue)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sede
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedes.map((sede) => (
            <VenueManagementCard
              key={sede.idSede}
              sede={sede}
              onClick={() => navigate(ROUTES.owner.venueDetail(sede.idSede))}
            />
          ))}
        </div>
      )}

      {/* Modal de gestión de fotos */}
      {selectedSedeForPhotos && (
        <SedePhotoManagement
          sede={{ idSede: selectedSedeForPhotos.idSede, nombre: selectedSedeForPhotos.nombre }}
          isOpen={photoManagementOpen}
          onClose={() => {
            setPhotoManagementOpen(false);
            setSelectedSedeForPhotos(null);
          }}
        />
      )}
    </div>
  );
};

export default SedeManagement;
