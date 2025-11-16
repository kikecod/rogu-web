import { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload, Trash2, Star, RefreshCw, Loader2 } from 'lucide-react';
import { photoService, type PhotoItem } from '../services/photo.service';

interface Props {
  canchaId: number;
  canchaNombre?: string;
  onFotosChange?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PhotoCrudManager = ({ canchaId, canchaNombre, onFotosChange }: Props) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!canchaId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await photoService.listByCancha(canchaId);
      setPhotos(list);
    } catch (err: any) {
      console.error('Error cargando fotos:', err);
      setError(err?.message || 'No se pudieron cargar las fotos');
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError(`${file.name} no es una imagen válida`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`${file.name} supera el tamaño máximo de 10MB`);
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Selecciona al menos una imagen');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(selectedFiles)) {
        if (!validateFile(file)) continue;
        try {
          await photoService.upload(canchaId, file);
        } catch (err: any) {
          console.error('Error subiendo foto:', err);
          setError(err?.message || 'Error al subir la foto');
        }
      }
      await loadPhotos();
      setSelectedFiles(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!window.confirm('¿Eliminar esta foto? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    try {
      await photoService.delete(photoId);
      await loadPhotos();
      onFotosChange?.();
    } catch (err: any) {
      console.error('Error eliminando foto:', err);
      setError(err?.message || 'No se pudo eliminar la foto');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrincipal = async (photoId: number) => {
    if (!window.confirm('¿Establecer esta foto como principal?')) return;
    setLoading(true);
    try {
      await photoService.setPrincipal(photoId, true);
      await loadPhotos();
      onFotosChange?.();
    } catch (err: any) {
      console.error('Error actualizando foto:', err);
      setError(err?.message || 'No se pudo actualizar la foto');
    } finally {
      setLoading(false);
    }
  };

  const photoCount = photos.length;
  const selectedFileNames = useMemo(
    () => (selectedFiles ? Array.from(selectedFiles).map((file) => file.name) : []),
    [selectedFiles]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Galería de fotos</p>
          <h3 className="text-xl font-semibold text-gray-900">
            {canchaNombre || 'Cancha'} · {photoCount || 0} foto(s)
          </h3>
        </div>
        <button
          onClick={loadPhotos}
          className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-3 w-3" />
          Recargar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 bg-gray-50">
          <span className="font-semibold text-gray-800">Subir imágenes</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFileNames.length > 0 && (
            <ul className="text-xs text-gray-500">
              {selectedFileNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </label>
        <div className="col-span-full flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFiles || selectedFiles.length === 0}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                Subir fotos nuevas
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-sm text-gray-500">No hay fotos aún</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {photos.map((foto) => (
              <div
                key={foto.idFoto}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                <img
                  src={foto.urlFoto}
                  alt={`Foto cancha ${canchaNombre}`}
                  className="h-40 w-full object-cover"
                />
                <div className="flex flex-1 flex-col justify-between gap-2 p-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Foto #{foto.idFoto}
                    </span>
                    {foto.esPrincipal && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSetPrincipal(foto.idFoto)}
                      className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <Star className="h-3 w-3 text-yellow-500" />
                      Marcar principal
                    </button>
                    <button
                      onClick={() => handleDelete(foto.idFoto)}
                      className="flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCrudManager;
