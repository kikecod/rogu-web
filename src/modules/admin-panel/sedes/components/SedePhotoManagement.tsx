import React, { useState, useEffect, useMemo } from 'react';
import { Upload, X, Trash2, Image, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { getApiUrl, getImageUrl } from '@/core/config/api';

interface Foto {
    idFoto: number;
    urlFoto: string;
}

interface SedePhotoManagementProps {
    sede: {
        idSede: number;
        nombre: string;
    };
    isOpen: boolean;
    onClose: () => void;
    fallbackFotos?: Foto[]; // opcional: fotos ya conocidas del detalle de la sede
}

const resolveUrl = (urlFoto: string) => (urlFoto?.startsWith('http') ? urlFoto : getImageUrl(urlFoto || ''));

const SedePhotoManagement: React.FC<SedePhotoManagementProps> = ({ sede, isOpen, onClose, fallbackFotos }) => {
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; fotoId: number | null }>({
        show: false,
        fotoId: null
    });

    const normalizedFallback = useMemo(() => {
        return Array.isArray(fallbackFotos)
            ? fallbackFotos.map((f) => ({ ...f, urlFoto: resolveUrl(f.urlFoto) }))
            : [];
    }, [fallbackFotos]);

    // Cargar fotos de la sede
    const loadFotos = async () => {
        // Si ya tenemos fotos en fallback, úsalas y evita llamar al endpoint 404
        if (normalizedFallback.length > 0) {
            setFotos(normalizedFallback);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`/fotos/sede/${sede.idSede}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const sedeFotos = await response.json();
                const normalized = Array.isArray(sedeFotos)
                  ? sedeFotos.map((f: Foto) => ({ ...f, urlFoto: resolveUrl(f.urlFoto) }))
                  : [];
                setFotos(normalized);
            } else {
                if (response.status === 404) {
                    console.warn(`[SedePhotoManagement] No se encontraron fotos para la sede ${sede.idSede} (404).`);
                    setFotos([]);
                } else {
                    console.error('[SedePhotoManagement] Error al obtener fotos:', response.status, response.statusText);
                }
            }
        } catch (error) {
            console.error('Error loading fotos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadFotos();
        }
    }, [isOpen, sede.idSede, normalizedFallback]);

    // Función para validar imagen
    const validateImage = (file: File): boolean => {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} no es una imagen válida`);
            return false;
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} es demasiado grande. Máximo 10MB por imagen`);
            return false;
        }

        return true;
    };

    // Subir fotos
    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            alert('Por favor selecciona al menos una imagen');
            return;
        }

        setUploading(true);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                // Validar la imagen
                if (!validateImage(file)) {
                    continue;
                }

                try {
                    // Crear FormData para enviar el archivo
                    const formData = new FormData();
                    formData.append('image', file);

                    // Subir la imagen al endpoint correcto (S3)
                    const response = await fetch(getApiUrl(`/fotos/upload/sede/${sede.idSede}`), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        alert(`Error al subir ${file.name}: ${error.message || 'Error desconocido'}`);
                    }
                } catch (uploadError) {
                    console.error(`Error subiendo ${file.name}:`, uploadError);
                    alert(`Error al subir ${file.name}: No se pudo procesar la imagen`);
                }
            }

            // Recargar fotos
            await loadFotos();
            setSelectedFiles(null);

            // Limpiar el input
            const fileInput = document.getElementById('sede-foto-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error uploading fotos:', error);
            alert('Error al subir las fotos');
        } finally {
            setUploading(false);
        }
    };

    // Mostrar confirmación de eliminación
    const showDeleteConfirm = (idFoto: number) => {
        setDeleteConfirm({ show: true, fotoId: idFoto });
    };

    // Cancelar eliminación
    const cancelDelete = () => {
        setDeleteConfirm({ show: false, fotoId: null });
    };

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (!deleteConfirm.fotoId) return;

        try {
            const response = await fetch(getApiUrl(`/fotos/${deleteConfirm.fotoId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Actualizar la lista local inmediatamente para mejor UX
                setFotos(prevFotos => prevFotos.filter(foto => foto.idFoto !== deleteConfirm.fotoId));
                // También recargar desde el servidor para asegurar consistencia
                await loadFotos();
                // Cerrar modal
                setDeleteConfirm({ show: false, fotoId: null });
            } else {
                const error = await response.json();
                alert(`Error al eliminar la foto: ${error.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la foto');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Fotos de {sede.nombre}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Sección de subida */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Subir nuevas fotos</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar imágenes
                            </label>
                            <input
                                id="sede-foto-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Puedes seleccionar múltiples imágenes. Formatos soportados: JPG, PNG, GIF. Máximo 10MB por imagen.
                            </p>
                        </div>

                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-800">
                                    {selectedFiles.length} archivo(s) seleccionado(s):
                                </p>
                                <ul className="mt-2 text-sm text-blue-700">
                                    {Array.from(selectedFiles).map((file, index) => (
                                        <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Subir Fotos
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Galería de fotos */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                        Fotos actuales ({fotos.length})
                    </h4>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : fotos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay fotos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Esta sede aún no tiene fotos. Sube algunas para mostrar a los usuarios.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {fotos.map((foto) => (
                                <div key={foto.idFoto} className="relative group">
                                    <img
                                        src={foto.urlFoto}
                                        alt="Foto de la sede"
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGFsIGNhcmdhcjwvdGV4dD48L3N2Zz4=';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <button
                                            onClick={() => showDeleteConfirm(foto.idFoto)}
                                            className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-200"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">Consejos para las fotos:</h4>
                            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                <li>Usa fotos de buena calidad para atraer más clientes</li>
                                <li>Incluye diferentes ángulos de la sede</li>
                                <li>Muestra las instalaciones y servicios adicionales</li>
                                <li>Tamaño máximo por imagen: 10MB</li>
                                <li>Formatos soportados: JPG, PNG, GIF</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Modal de confirmación para eliminar */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                        <div className="relative p-6 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Confirmar eliminación
                                    </h3>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500">
                                    ¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SedePhotoManagement;
