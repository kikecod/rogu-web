import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Building, Phone, Mail } from 'lucide-react';

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
  canchas?: any[];
}

interface SedeFormData {
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

interface SedeManagementProps {
  id_personaD: number;
  onSedeSelect: (sede: Sede) => void;
}

const SedeManagement: React.FC<SedeManagementProps> = ({ id_personaD, onSedeSelect }) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SedeFormData>({
    nombre: '',
    descripcion: '',
    direccion: '',
    latitud: '',
    longitud: '',
    telefono: '',
    email: '',
    politicas: '',
    estado: 'Activo',
    NIT: '',
    LicenciaFuncionamiento: ''
  });

  // Cargar sedes del dueño
  const loadSedes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sede`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const allSedes = await response.json();
        // Filtrar solo las sedes del dueño actual
        const mySedes = allSedes.filter((sede: any) => sede.id_personaD === id_personaD);
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
  }, [id_personaD]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      direccion: '',
      latitud: '',
      longitud: '',
      telefono: '',
      email: '',
      politicas: '',
      estado: 'Activo',
      NIT: '',
      LicenciaFuncionamiento: ''
    });
    setEditingSede(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingSede 
        ? `http://localhost:3000/api/sede/${editingSede.idSede}`
        : 'http://localhost:3000/api/sede';
      
      const method = editingSede ? 'PATCH' : 'POST';
      
      const payload = editingSede 
        ? formData 
        : { ...formData, id_personaD };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await loadSedes();
        resetForm();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'Error al guardar la sede'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la sede');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sede: Sede) => {
    setFormData({
      nombre: sede.nombre,
      descripcion: sede.descripcion,
      direccion: sede.direccion,
      latitud: sede.latitud,
      longitud: sede.longitud,
      telefono: sede.telefono,
      email: sede.email,
      politicas: sede.politicas,
      estado: sede.estado,
      NIT: sede.NIT,
      LicenciaFuncionamiento: sede.LicenciaFuncionamiento
    });
    setEditingSede(sede);
    setShowForm(true);
  };

  const handleDelete = async (idSede: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sede?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/sede/${idSede}`, {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Lista de sedes */}
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
                <h3 className="text-lg font-semibold text-gray-900">{sede.nombre}</h3>
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
                  {sede.direccion}
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sede.estado === 'Activo' 
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSede ? 'Editar Sede' : 'Nueva Sede'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Sede *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud *
                  </label>
                  <input
                    type="text"
                    name="latitud"
                    value={formData.latitud}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: -16.5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud *
                  </label>
                  <input
                    type="text"
                    name="longitud"
                    value={formData.longitud}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: -68.1500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT *
                  </label>
                  <input
                    type="text"
                    name="NIT"
                    value={formData.NIT}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Licencia de Funcionamiento *
                  </label>
                  <input
                    type="text"
                    name="LicenciaFuncionamiento"
                    value={formData.LicenciaFuncionamiento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Políticas *
                  </label>
                  <textarea
                    name="politicas"
                    value={formData.politicas}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Políticas de uso, cancelación, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingSede ? 'Actualizar' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SedeManagement;