import 'react-easy-crop/react-easy-crop.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Camera, Loader2, ImageOff, Trash2, ZoomIn, CheckCircle2, XCircle } from 'lucide-react';
import profileService from '../services/profileService';
import { readFileAsDataUrl, getCroppedFile } from '../lib/imageTools';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  fallbackInitials: string;
  onAvatarUpdated?: (avatar?: string | null) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl, fallbackInitials, onAvatarUpdated }) => {
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [cacheBuster, setCacheBuster] = useState(0);

  useEffect(() => {
    if (!avatarUrl) {
      setCacheBuster(0);
      return;
    }
    setCacheBuster(Date.now());
  }, [avatarUrl]);

  const previewUrl = useMemo(() => {
    if (!avatarUrl) return null;
    if (!cacheBuster) return avatarUrl;
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}v=${cacheBuster}`;
  }, [avatarUrl, cacheBuster]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageSrc(dataUrl);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo cargar la imagen seleccionada.' });
    } finally {
      event.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedArea) {
      setFeedback({ type: 'error', message: 'Selecciona un área válida para recortar el avatar.' });
      return;
    }

    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedFile(imageSrc, croppedArea);
      const result = await profileService.uploadAvatar(croppedFile);
      setFeedback({ type: 'success', message: 'Avatar actualizado correctamente.' });
      setIsCropping(false);
      setImageSrc(null);
      setCacheBuster(Date.now());
      onAvatarUpdated?.(result?.avatar ?? null);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo guardar el avatar.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
    setCroppedArea(null);
    setZoom(1);
  };

  const handleRemove = async () => {
    setFeedback(null);
    try {
      setIsProcessing(true);
      await profileService.removeAvatar();
      setFeedback({ type: 'success', message: 'Avatar eliminado correctamente.' });
      setCacheBuster(Date.now());
      onAvatarUpdated?.(null);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo eliminar el avatar.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Avatar</h2>
          <p className="text-sm text-neutral-500">Sube una imagen cuadrada de al menos 512×512 px.</p>
        </div>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium cursor-pointer hover:bg-indigo-600/90 transition disabled:opacity-70">
          <Camera className="h-4 w-4" />
          <span>Actualizar</span>
          <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" disabled={isProcessing} />
        </label>
      </div>

      {feedback && (
        <div
          className={`inline-flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border border-neutral-200 flex items-center justify-center overflow-hidden bg-neutral-100 text-neutral-500 text-2xl font-semibold">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar actual" className="h-full w-full object-cover" />
          ) : (
            <span>{fallbackInitials || <ImageOff className="h-8 w-8 text-neutral-400" />}</span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-neutral-500">
            Formatos permitidos: <strong>JPG, PNG, WEBP</strong>. Se recortará automáticamente a un cuadrado.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:border-neutral-300 transition disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar avatar
            </button>
          </div>
        </div>
      </div>

      {isCropping && imageSrc && (
        <div className="mt-4 rounded-xl border border-neutral-200 overflow-hidden">
          <div className="relative h-72 w-full bg-neutral-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 px-4 py-3 border-t border-neutral-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ZoomIn className="h-4 w-4 text-neutral-500" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full sm:w-48 accent-indigo-600"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-600/90 transition disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Guardar recorte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
