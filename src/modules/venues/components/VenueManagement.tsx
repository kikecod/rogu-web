import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Building, Phone, Mail } from 'lucide-react';
import type { SedeFormData } from '../types/venue.types';
import { 
  getDepartments, 
  getCitiesByDepartment, 
  getDistrictsByCity,
  getFullAddress
} from '../lib/boliviaData';

interface Sede {
  idSede: number;
  nombre: string;
  descripcion: string;
  // Nuevos campos
  country?: string;
  countryCode?: string;
  stateProvince?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  // Campos legacy para compatibilidad
  direccion?: string;
  latitud?: string;
  longitud?: string;
  // Otros campos
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
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
  const [submitting, setSubmitting] = useState(false);

  // Estados para selectores geográficos
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [formData, setFormData] = useState<SedeFormData>({
    nombre: '',
    descripcion: '',
    country: 'Bolivia',
    countryCode: 'BO',
    stateProvince: '',
    city: '',
    district: '',
    addressLine: '',
    postalCode: '00000',
    latitude: null,
    longitude: null,
    timezone: 'America/La_Paz',
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

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      country: 'Bolivia',
      countryCode: 'BO',
      stateProvince: '',
      city: '',
      district: '',
      addressLine: '',
      postalCode: '00000',
      latitude: null,
      longitude: null,
      timezone: 'America/La_Paz',
      telefono: '',
      email: '',
      politicas: '',
      estado: 'Activo',
      NIT: '',
      LicenciaFuncionamiento: ''
    });
    setSelectedDepartment('');
    setSelectedCity('');
    setSelectedDistrict('');
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
      
      // Preparar payload según la nueva estructura del backend
      const payload = editingSede 
        ? formData 
        : { ...formData, idPersonaD };

      console.log('📤 Enviando payload a', url, ':', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sede guardada exitosamente:', result);
        await loadSedes();
        resetForm();
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        alert('Error: ' + (error.message || 'Error al guardar la sede'));
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      alert('Error al guardar la sede');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sede: Sede) => {
    // Convertir datos legacy a nueva estructura
    setFormData({
      nombre: sede.nombre,
      descripcion: sede.descripcion,
      country: sede.country || 'Bolivia',
      countryCode: sede.countryCode || 'BO',
      stateProvince: sede.stateProvince || '',
      city: sede.city || '',
      district: sede.district || '',
      addressLine: sede.addressLine || sede.direccion || '',
      postalCode: sede.postalCode || '00000',
      latitude: sede.latitude || (sede.latitud ? parseFloat(sede.latitud) : null),
      longitude: sede.longitude || (sede.longitud ? parseFloat(sede.longitud) : null),
      timezone: sede.timezone || 'America/La_Paz',
      telefono: sede.telefono,
      email: sede.email,
      politicas: sede.politicas,
      estado: sede.estado,
      NIT: sede.NIT,
      LicenciaFuncionamiento: sede.LicenciaFuncionamiento
    });

    // Inicializar selectores geográficos si hay datos
    if (sede.stateProvince) {
      const departments = getDepartments();
      const foundDept = departments.find(dept => dept.name === sede.stateProvince);
      if (foundDept) {
        setSelectedDepartment(foundDept.id);
        
        if (sede.city) {
          const cities = getCitiesByDepartment(foundDept.id);
          const foundCity = cities.find(city => city.name === sede.city);
          if (foundCity) {
            setSelectedCity(foundCity.id);
            
            if (sede.district) {
              const districts = getDistrictsByCity(foundCity.id);
              const foundDistrict = districts.find(district => district.name === sede.district);
              if (foundDistrict) {
                setSelectedDistrict(foundDistrict.id);
              }
            }
          }
        }
      }
    }

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

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedCity('');
    setSelectedDistrict('');
    
    const departmentData = getDepartments().find(dep => dep.id === departmentId);
    if (departmentData) {
      const addressData = getFullAddress(departmentId, '', '');
      setFormData(prev => ({
        ...prev,
        stateProvince: addressData.stateProvince,
        city: '',
        district: ''
      }));
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDistrict('');
    
    if (selectedDepartment && cityId) {
      const addressData = getFullAddress(selectedDepartment, cityId, '');
      setFormData(prev => ({
        ...prev,
        city: addressData.city,
        district: ''
      }));
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    
    if (selectedDepartment && selectedCity && districtId) {
      const addressData = getFullAddress(selectedDepartment, selectedCity, districtId);
      setFormData(prev => ({
        ...prev,
        district: addressData.district
      }));
    }
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

                {/* Sección de Ubicación Geográfica */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ubicación Geográfica
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar departamento</option>
                    {getDepartments().map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    required
                    disabled={!selectedDepartment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {selectedDepartment && getCitiesByDepartment(selectedDepartment).map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distrito/Zona *
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    disabled={!selectedCity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar distrito</option>
                    {selectedCity && getDistrictsByCity(selectedCity).map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Específica *
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Av. Saavedra #2540 esq. Calle 18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="00000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria *
                  </label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                {/* Sección de Coordenadas */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 mt-4">
                    📍 Coordenadas Geográficas
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      latitude: e.target.value ? parseFloat(e.target.value) : null
                    }))}
                    required
                    placeholder="Ej: -16.5124789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      longitude: e.target.value ? parseFloat(e.target.value) : null
                    }))}
                    required
                    placeholder="Ej: -68.0897456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sección de Contacto */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 mt-4 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Información de Contacto
                  </h4>
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
                    placeholder="+591 70000000"
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
                    placeholder="contacto@sede.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sección Legal y Regulatoria */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 mt-4 flex items-center">
                    📄 Información Legal
                  </h4>
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
                    placeholder="123456789"
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