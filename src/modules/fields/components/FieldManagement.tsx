import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Camera, Tag, Calendar } from 'lucide-react';
import PhotoManagement from './PhotoManagement';
import CalendarioReservasPage from '../../analytics/pages/CalendarioReservasPage';
import FieldFormWizard from './FieldFormWizard';
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
  horaApertura: string;
  horaCierre: string;
  fotos?: any[];
  parte?: any[];
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

const FieldManagement: React.FC<CanchaManagementProps> = ({ sede, onBack }) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCancha, setEditingCancha] = useState<Cancha | null>(null);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [fotoCancha, setFotoCancha] = useState<Cancha | null>(null);
  const [showReservas, setShowReservas] = useState(false);
  const [reservaCancha, setReservaCancha] = useState<Cancha | null>(null);

  // Cargar canchas de la sede
  const loadCanchas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const allCanchas = await response.json();
        const sedeCanchas = allCanchas.filter((cancha: any) => {
          return cancha.id_Sede === sede.idSede;
        });

        // Para cada cancha, cargar sus partes (disciplinas)
        for (const cancha of sedeCanchas) {
          try {
            const parteResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  const handleEdit = (cancha: Cancha) => {
    setEditingCancha(cancha);
    setShowForm(true);
  };

  const handleDelete = async (idCancha: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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

  const openDisciplinaModal = (cancha: Cancha) => {
    setSelectedCancha(cancha);
    const canchaParteDisciplinas =
      cancha.parte?.map(p => p.idDisciplina).filter(id => id) || [];
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
            await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/parte/${selectedCancha.idCancha}/${parte.idDisciplina}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
          } catch (deleteError) {
            // Continuar si hay error eliminando
          }
        }
      }

      // Agregar las nuevas disciplinas seleccionadas
      for (const idDisciplina of selectedDisciplinas) {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              idCancha: selectedCancha.idCancha,
              idDisciplina: idDisciplina,
            }),
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
      <div className="flex justify-center items-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  // Si se está mostrando las reservas, renderizar el componente CalendarioReservasPage
  if (showReservas && reservaCancha) {
    return (
      <CalendarioReservasPage
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Gestión de canchas
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Canchas de <span className="text-blue-600">{sede.nombre}</span>
            </h2>
            <p className="text-sm text-gray-500">
              Administra tus canchas, disciplinas, fotos y reservas desde este panel.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Nueva Cancha
        </button>
      </div>

      {/* Lista de canchas */}
      {canchas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Aún no tienes canchas</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">
            Agrega tu primera cancha a esta sede para empezar a gestionar reservas, disciplinas y
            fotos.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nueva Cancha
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {canchas.map(cancha => (
            <div
              key={cancha.idCancha}
              className="group relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cancha.nombre}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {cancha.horaApertura} - {cancha.horaCierre}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cancha)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cancha.idCancha)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Superficie</span>
                  <span className="font-medium text-gray-800">{cancha.superficie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensiones</span>
                  <span className="font-medium text-gray-800">{cancha.dimensiones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Aforo máx.</span>
                  <span className="font-medium text-gray-800">{cancha.aforoMax} personas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cubierta</span>
                  <span className="font-medium text-gray-800">
                    {cancha.cubierta ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Iluminación</span>
                  <span className="font-medium text-gray-800">{cancha.iluminacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio</span>
                  <span className="font-semibold text-green-600">Bs. {cancha.precio}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-3">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cancha.estado === 'Disponible'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                        : cancha.estado === 'Mantenimiento' || cancha.estado === 'En Mantenimiento'
                          ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-100'
                      }`}
                  >
                    {cancha.estado}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(cancha.parte && cancha.parte.length) || 0} disciplinas
                  </span>
                </div>

                {/* Mostrar nombres de disciplinas */}
                {cancha.parte && cancha.parte.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium text-gray-500">Disciplinas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cancha.parte.map((parte: any, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] font-medium text-blue-700"
                        >
                          {parte.disciplina?.nombre || `Disciplina ${parte.idDisciplina}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => openDisciplinaModal(cancha)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                  >
                    <Tag className="h-4 w-4" />
                    Gestionar disciplinas
                  </button>
                  <button
                    onClick={() => openFotoModal(cancha)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                  >
                    <Camera className="h-4 w-4" />
                    Gestionar fotos
                  </button>
                  <button
                    onClick={() => openReservationManagement(cancha)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Calendar className="h-4 w-4" />
                    Calendario de reservas
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard del formulario de cancha */}
      {showForm && (
        <FieldFormWizard
          initialData={editingCancha ? {
            idCancha: editingCancha.idCancha,
            nombre: editingCancha.nombre,
            superficie: editingCancha.superficie,
            cubierta: editingCancha.cubierta,
            aforoMax: editingCancha.aforoMax,
            dimensiones: editingCancha.dimensiones,
            reglasUso: editingCancha.reglasUso,
            iluminacion: editingCancha.iluminacion,
            estado: editingCancha.estado,
            precio: editingCancha.precio,
            horaApertura: editingCancha.horaApertura,
            horaCierre: editingCancha.horaCierre,
          } : undefined}
          isEditing={!!editingCancha}
          idSede={sede.idSede}
          onComplete={() => {
            setShowForm(false);
            setEditingCancha(null);
            loadCanchas();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingCancha(null);
          }}
        />
      )}

      {/* Modal de disciplinas */}
      {showDisciplinaModal && selectedCancha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Disciplinas para {selectedCancha.nombre}
                </h3>
                <p className="text-xs text-gray-500">
                  Marca las disciplinas que se pueden practicar en esta cancha.
                </p>
              </div>
              <button
                onClick={() => setShowDisciplinaModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto px-6 py-4 space-y-3">
              {disciplinas.map(disciplina => (
                <div
                  key={disciplina.idDisciplina}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedDisciplinas.includes(disciplina.idDisciplina)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedDisciplinas([...selectedDisciplinas, disciplina.idDisciplina]);
                      } else {
                        setSelectedDisciplinas(
                          selectedDisciplinas.filter(id => id !== disciplina.idDisciplina)
                        );
                      }
                    }}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {disciplina.nombre}
                    </h4>
                    <p className="text-xs text-gray-500">{disciplina.categoria}</p>
                    <p className="mt-1 text-[0.7rem] text-gray-400">
                      {disciplina.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowDisciplinaModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveDisciplinas}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
              >
                Guardar disciplinas
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

export default FieldManagement;