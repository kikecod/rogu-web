import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Camera, Tag, Calendar } from 'lucide-react';
import PhotoManagement from './PhotoManagement';
import ReservationManagement from './ReservationManagement';
import { getApiUrl } from '@/core/config/api';

interface Cancha {
  idCancha: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
  fotos?: any[];
  parte?: any[];
}

interface CanchaFormData {
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
}

interface Disciplina {
  idDisciplina: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

interface CanchaManagementProps {
  sede: {
    idSede: number;
    nombre: string;
  };
  onBack: () => void;
}

const CanchaManagement: React.FC<CanchaManagementProps> = ({ sede, onBack }) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCancha, setEditingCancha] = useState<Cancha | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [fotoCancha, setFotoCancha] = useState<Cancha | null>(null);
  const [showReservas, setShowReservas] = useState(false);
  const [reservaCancha, setReservaCancha] = useState<Cancha | null>(null);

  const [formData, setFormData] = useState<CanchaFormData>({
    nombre: '',
    superficie: '',
    cubierta: false,
    aforoMax: 0,
    dimensiones: '',
    reglasUso: '',
    iluminacion: '',
    estado: 'Disponible',
    precio: 0
  });

  // Cargar canchas de la sede
  const loadCanchas = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cancha`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const allCanchas = await response.json();
        const sedeCanchas = allCanchas.filter((cancha: any) => {
          return cancha.id_Sede === sede.idSede;
        });
        
        // Para cada cancha, cargar sus partes (disciplinas)
        for (const cancha of sedeCanchas) {
          try {
            const parteResponse = await fetch(`http://localhost:3000/api/parte`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (parteResponse.ok) {
              const allPartes = await parteResponse.json();
              cancha.parte = allPartes.filter((parte: any) => parte.idCancha === cancha.idCancha);
            } else {
              cancha.parte = [];
            }
          } catch (error) {
            cancha.parte = [];
          }
        }
        
        setCanchas(sedeCanchas);
      }
    } catch (error) {
      console.error('Error loading canchas:', error);
    }
  };

  // Cargar disciplinas disponibles
  const loadDisciplinas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(getApiUrl('/disciplina'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allDisciplinas = await response.json();
        setDisciplinas(allDisciplinas);
      } else {
        console.error('Error al cargar disciplinas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading disciplinas:', error);
    }
  };

  useEffect(() => {
    Promise.all([loadCanchas(), loadDisciplinas()]).finally(() => setLoading(false));
  }, [sede.idSede]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      superficie: '',
      cubierta: false,
      aforoMax: 0,
      dimensiones: '',
      reglasUso: '',
      iluminacion: '',
      estado: 'Disponible',
      precio: 0
    });
    setEditingCancha(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCancha 
        ? `http://localhost:3000/api/cancha/${editingCancha.idCancha}`
        : 'http://localhost:3000/api/cancha';
      
      const method = editingCancha ? 'PATCH' : 'POST';
      
      const payload = editingCancha 
        ? formData 
        : { ...formData, idSede: sede.idSede };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await loadCanchas();
        resetForm();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'Error al guardar la cancha'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cancha: Cancha) => {
    setFormData({
      nombre: cancha.nombre,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      aforoMax: cancha.aforoMax,
      dimensiones: cancha.dimensiones,
      reglasUso: cancha.reglasUso,
      iluminacion: cancha.iluminacion,
      estado: cancha.estado,
      precio: cancha.precio
    });
    setEditingCancha(cancha);
    setShowForm(true);
  };

  const handleDelete = async (idCancha: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/cancha/${idCancha}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadCanchas();
      } else {
        alert('Error al eliminar la cancha');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la cancha');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const openDisciplinaModal = (cancha: Cancha) => {
    setSelectedCancha(cancha);
    const canchaParteDisciplinas = cancha.parte?.map(p => p.idDisciplina).filter(id => id) || [];
    setSelectedDisciplinas(canchaParteDisciplinas);
    setShowDisciplinaModal(true);
  };

  const openFotoModal = (cancha: Cancha) => {
    setFotoCancha(cancha);
    setShowFotoModal(true);
  };

  const openReservationManagement = (cancha: Cancha) => {
    setReservaCancha(cancha);
    setShowReservas(true);
  };

  const saveDisciplinas = async () => {
    if (!selectedCancha) return;

    try {
      // Eliminar todas las partes existentes de la cancha
      if (selectedCancha.parte && selectedCancha.parte.length > 0) {
        for (const parte of selectedCancha.parte) {
          try {
            await fetch(`http://localhost:3000/api/parte/${selectedCancha.idCancha}/${parte.idDisciplina}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          } catch (deleteError) {
            // Continuar si hay error eliminando
          }
        }
      }

      // Agregar las nuevas disciplinas seleccionadas
      for (const idDisciplina of selectedDisciplinas) {
        try {
          await fetch('http://localhost:3000/api/parte', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              idCancha: selectedCancha.idCancha,
              idDisciplina: idDisciplina
            })
          });
        } catch (error) {
          // Continuar si hay error creando
        }
      }

      await loadCanchas();
      setShowDisciplinaModal(false);
      setSelectedCancha(null);
    } catch (error) {
      console.error('Error saving disciplinas:', error);
      alert('Error al guardar las disciplinas');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si se está mostrando las reservas, renderizar el componente ReservationManagement
  if (showReservas && reservaCancha) {
    return (
      <ReservationManagement
        cancha={reservaCancha}
        onBack={() => {
          setShowReservas(false);
          setReservaCancha(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Canchas de {sede.nombre}</h2>
            <p className="text-gray-600">Gestiona las canchas de esta sede</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 mr-3"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cancha
        </button>
        
      </div>

      {/* Lista de canchas */}
      {canchas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay canchas</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primera cancha a esta sede.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cancha
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canchas.map((cancha) => (
            <div key={cancha.idCancha} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{cancha.nombre}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(cancha)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cancha.idCancha)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Superficie:</span>
                  <span>{cancha.superficie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensiones:</span>
                  <span>{cancha.dimensiones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Aforo máx:</span>
                  <span>{cancha.aforoMax} personas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cubierta:</span>
                  <span>{cancha.cubierta ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-semibold text-green-600">Bs. {cancha.precio}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cancha.estado === 'Disponible' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cancha.estado}
                  </span>
                  <span className="text-sm text-gray-500">
                    {cancha.parte?.length || 0} disciplinas
                  </span>
                </div>

                {/* Mostrar nombres de disciplinas */}
                {cancha.parte && cancha.parte.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Disciplinas:</p>
                    <div className="flex flex-wrap gap-1">
                      {cancha.parte.map((parte: any, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {parte.disciplina?.nombre || `Disciplina ${parte.idDisciplina}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => openDisciplinaModal(cancha)}
                    className="w-full bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Gestionar Disciplinas
                  </button>
                  <button
                    onClick={() => openFotoModal(cancha)}
                    className="w-full bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Gestionar Fotos
                  </button>
                  <button
                    onClick={() => openReservationManagement(cancha)}
                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Reservas
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del formulario de cancha */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCancha ? 'Editar Cancha' : 'Nueva Cancha'}
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
                    Nombre de la Cancha *
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
                    Superficie *
                  </label>
                  <select
                    name="superficie"
                    value={formData.superficie}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar superficie</option>
                    <option value="Césped natural">Césped natural</option>
                    <option value="Césped sintético">Césped sintético</option>
                    <option value="Cemento">Cemento</option>
                    <option value="Madera">Madera</option>
                    <option value="Parquet">Parquet</option>
                    <option value="Tierra batida">Tierra batida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensiones *
                  </label>
                  <input
                    type="text"
                    name="dimensiones"
                    value={formData.dimensiones}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 40x20 metros"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aforo Máximo *
                  </label>
                  <input
                    type="number"
                    name="aforoMax"
                    value={formData.aforoMax}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Iluminación *
                  </label>
                  <select
                    name="iluminacion"
                    value={formData.iluminacion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar iluminación</option>
                    <option value="Natural">Natural</option>
                    <option value="LED">LED</option>
                    <option value="Halógena">Halógena</option>
                    <option value="Fluorescente">Fluorescente</option>
                  </select>
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
                    <option value="Disponible">Disponible</option>
                    <option value="No disponible">No disponible</option>
                    <option value="Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (Bs.) *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cubierta"
                    checked={formData.cubierta}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Cancha cubierta
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reglas de Uso *
                  </label>
                  <textarea
                    name="reglasUso"
                    value={formData.reglasUso}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Reglas y restricciones para el uso de la cancha"
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
                  {submitting ? 'Guardando...' : editingCancha ? 'Actualizar' : 'Crear Cancha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de disciplinas */}
      {showDisciplinaModal && selectedCancha && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Disciplinas para {selectedCancha.nombre}
              </h3>
              <button
                onClick={() => setShowDisciplinaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {disciplinas.map((disciplina) => (
                <div key={disciplina.idDisciplina} className="flex items-center space-x-3 p-3 border rounded-md">
                  <input
                    type="checkbox"
                    checked={selectedDisciplinas.includes(disciplina.idDisciplina)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDisciplinas([...selectedDisciplinas, disciplina.idDisciplina]);
                      } else {
                        setSelectedDisciplinas(selectedDisciplinas.filter(id => id !== disciplina.idDisciplina));
                      }
                    }}
                    className="mr-2"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{disciplina.nombre}</h4>
                    <p className="text-sm text-gray-500">{disciplina.categoria}</p>
                    <p className="text-xs text-gray-400">{disciplina.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDisciplinaModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveDisciplinas}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Guardar Disciplinas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de fotos */}
      {fotoCancha && (
        <PhotoManagement
          cancha={fotoCancha}
          isOpen={showFotoModal}
          onClose={() => {
            setShowFotoModal(false);
            setFotoCancha(null);
          }}
        />
      )}
    </div>
  );
};

export default CanchaManagement;