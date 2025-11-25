import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Building, Phone, Mail, AlertCircle, Image } from 'lucide-react';
import type { ApiSede } from '../types/venue.types';
import SedeFormWizard from './SedeFormWizard';
import { SedePhotoManagement } from '@/admin-panel/sedes/components';

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
}

interface SedeManagementProps {
  idPersonaD: number;
  onSedeSelect: (sede: Sede) => void;
}

const SedeManagement: React.FC<SedeManagementProps> = ({ idPersonaD, onSedeSelect }) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [photoManagementOpen, setPhotoManagementOpen] = useState(false);
  const [selectedSedeForPhotos, setSelectedSedeForPhotos] = useState<Sede | null>(null);

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
        setSedes(mySedes);
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

  const handleDelete = async (idSede: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sede?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${idSede}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadSedes();
      } else {
        alert('Error al eliminar la sede');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la sede');
    }
  };

  const handleEdit = (sede: Sede) => {
    setEditingSede(sede);
    setShowForm(true);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingSede(null);
    loadSedes();
  };

  const handleManagePhotos = (sede: Sede) => {
    setSelectedSedeForPhotos(sede);
    setPhotoManagementOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <SedeFormWizard
        idPersonaD={idPersonaD}
        initialData={editingSede ? {
          idSede: editingSede.idSede,
          nombre: editingSede.nombre,
          descripcion: editingSede.descripcion,
          country: editingSede.country || 'Bolivia',
          countryCode: editingSede.countryCode || 'BO',
          stateProvince: editingSede.stateProvince || '',
          city: editingSede.city || '',
          district: editingSede.district || '',
          addressLine: editingSede.addressLine || editingSede.direccion || '',
          postalCode: editingSede.postalCode || '00000',
          latitude: editingSede.latitude || (editingSede.latitud ? parseFloat(editingSede.latitud) : null),
          longitude: editingSede.longitude || (editingSede.longitud ? parseFloat(editingSede.longitud) : null),
          timezone: editingSede.timezone || 'America/La_Paz',
          telefono: editingSede.telefono,
          email: editingSede.email,
          politicas: editingSede.politicas,
          estado: editingSede.estado,
          LicenciaFuncionamiento: editingSede.LicenciaFuncionamiento
        } : undefined}
        isEditing={!!editingSede}
        onComplete={handleFormComplete}
        onCancel={() => {
          setShowForm(false);
          setEditingSede(null);
        }}
      />
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
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
              onClick={() => setShowForm(true)}
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
            <div key={sede.idSede} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sede.nombre}</h3>
                  {sede.verificada === false && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pendiente Verificación
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(sede)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sede.idSede)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{sede.descripcion}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {sede.addressLine || sede.direccion || 'Sin dirección'}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {sede.telefono}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {sede.email}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sede.estado === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {sede.estado}
                  </span>
                  <span className="text-sm text-gray-500">
                    {sede.canchas?.length || 0} canchas
                  </span>
                </div>
                <button
                  onClick={() => onSedeSelect(sede)}
                  className="w-full mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Gestionar Canchas
                </button>
                <button
                  onClick={() => handleManagePhotos(sede)}
                  className="w-full mt-2 bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Gestionar Fotos
                </button>
              </div>
            </div>
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
