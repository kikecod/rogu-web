import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X, Info, Clock, DollarSign, Settings } from 'lucide-react';

interface FieldFormData {
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
}

interface FieldFormWizardProps {
  initialData?: FieldFormData & { idCancha?: number };
  isEditing?: boolean;
  idSede: number;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4;

const FieldFormWizard: React.FC<FieldFormWizardProps> = ({
  initialData,
  isEditing = false,
  idSede,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FieldFormData>({
    nombre: initialData?.nombre || '',
    superficie: initialData?.superficie || '',
    cubierta: initialData?.cubierta || false,
    aforoMax: initialData?.aforoMax || 0,
    dimensiones: initialData?.dimensiones || '',
    reglasUso: initialData?.reglasUso || '',
    iluminacion: initialData?.iluminacion || '',
    estado: initialData?.estado || 'Disponible',
    precio: initialData?.precio || 0,
    horaApertura: initialData?.horaApertura || '06:00',
    horaCierre: initialData?.horaCierre || '23:00',
  });

  const steps = [
    { number: 1 as Step, title: 'Información Básica', icon: Info },
    { number: 2 as Step, title: 'Características', icon: Settings },
    { number: 3 as Step, title: 'Horarios y Precio', icon: Clock },
    { number: 4 as Step, title: 'Confirmación', icon: Check },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nombre && formData.superficie && formData.dimensiones);
      case 2:
        return !!(formData.iluminacion && formData.reglasUso);
      case 3:
        return !!(formData.horaApertura && formData.horaCierre && formData.precio > 0);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (currentStep === 3) {
      // Guardar la cancha
      await saveCancha();
    } else {
      setCurrentStep(prev => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev - 1) as Step);
  };

  const saveCancha = async () => {
    setSubmitting(true);
    try {
      const url = isEditing && initialData?.idCancha
        ? `${import.meta.env.VITE_API_BASE_URL}/cancha/${initialData.idCancha}`
        : `${import.meta.env.VITE_API_BASE_URL}/cancha`;

      const method = isEditing ? 'PATCH' : 'POST';

      // Asegurar que los números se envíen como números
      const cleanedData = {
        ...formData,
        aforoMax: Number(formData.aforoMax),
        precio: Number(formData.precio)
      };

      const payload = isEditing ? cleanedData : {
        ...cleanedData,
        idSede: idSede
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.message || (isEditing ? 'Error al actualizar la cancha' : 'Error al crear la cancha');
        alert('Error: ' + errorMessage);
        throw new Error(errorMessage);
      }

      setCurrentStep(4);
    } catch (error) {
      console.error('Error en saveCancha:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Cancha' : 'Nueva Cancha'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-300'}
                      ${isCompleted || isActive ? 'text-white' : 'text-gray-600'}
                    `}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>

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
                    placeholder="Ej: Cancha de Fútbol A"
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
                    <option value="Césped Natural">Césped Natural</option>
                    <option value="Césped Sintético">Césped Sintético</option>
                    <option value="Cemento">Cemento</option>
                    <option value="Parquet">Parquet</option>
                    <option value="Tierra">Tierra</option>
                    <option value="Arena">Arena</option>
                    <option value="Otro">Otro</option>
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
                    placeholder="Ej: 40m x 20m"
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
                    placeholder="Número de personas"
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
                    <option value="Disponible">Disponible</option>
                    <option value="Mantenimiento">En Mantenimiento</option>
                    <option value="No Disponible">No Disponible</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cubierta"
                    id="cubierta"
                    checked={formData.cubierta}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="cubierta" className="ml-2 block text-sm text-gray-700">
                    Cancha cubierta
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Características */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Características de la Cancha</h3>

              <div className="grid grid-cols-1 gap-4">
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
                    <option value="">Seleccionar tipo de iluminación</option>
                    <option value="Natural">Natural</option>
                    <option value="Artificial">Artificial</option>
                    <option value="Mixta">Mixta</option>
                    <option value="Sin iluminación">Sin iluminación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reglas de Uso *
                  </label>
                  <textarea
                    name="reglasUso"
                    value={formData.reglasUso}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Describe las reglas y condiciones para el uso de la cancha..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Horarios y Precio */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios y Precio</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Apertura *
                  </label>
                  <input
                    type="time"
                    name="horaApertura"
                    value={formData.horaApertura}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Cierre *
                  </label>
                  <input
                    type="time"
                    name="horaCierre"
                    value={formData.horaCierre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Hora (Bs.) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditing ? '¡Cancha actualizada!' : '¡Cancha creada!'}
                </h3>
                <p className="text-gray-600">
                  {isEditing
                    ? 'Los cambios en la cancha han sido guardados correctamente.'
                    : 'La cancha ha sido creada exitosamente.'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-3">Próximos pasos:</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                    <span>Puedes gestionar las disciplinas disponibles en esta cancha</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                    <span>Agrega fotos para que los usuarios conozcan tus instalaciones</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                    <span>La cancha ya está disponible para recibir reservas</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Volver a Mis Canchas
              </button>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {currentStep < 4 && (
          <div className="flex justify-between px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting || !validateStep(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                'Procesando...'
              ) : (
                <>
                  {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldFormWizard;
