import React, { useState } from 'react';
import { AlertTriangle, Archive, Loader2 } from 'lucide-react';
import profileService from '../services/profileService';
import { useAuth } from '@/auth/hooks/useAuth';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

const ProfileDangerZone: React.FC = () => {
  const { logout } = useAuth();

  const [exporting, setExporting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const resetDeleteForm = () => {
    setDeletePassword('');
    setDeleteConfirmation('');
  };

  const handleExportData = async () => {
    setFeedback(null);
    try {
      setExporting(true);
      const result = await profileService.exportData();

      const link = document.createElement('a');
      link.href = `data:${result.mimeType};base64,${result.base64}`;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFeedback({
        type: 'success',
        message: 'Se generó la exportación de tus datos. Revisa tu carpeta de descargas.',
      });
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo exportar la información.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivate = async () => {
    setFeedback(null);
    const confirm = window.confirm(
      '¿Seguro que deseas desactivar temporalmente tu cuenta? Podrás reactivarla iniciando sesión nuevamente.',
    );
    if (!confirm) return;

    try {
      setDeactivating(true);
      await profileService.deactivateAccount({});
      setFeedback({
        type: 'success',
        message: 'Tu cuenta ha sido desactivada. Te cerraremos la sesión por seguridad.',
      });
      await logout();
      window.location.href = '/';
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo desactivar la cuenta.' });
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!deletePassword || deleteConfirmation.trim().toUpperCase() !== 'ELIMINAR') {
      setFeedback({ type: 'error', message: 'Debes ingresar tu contraseña y escribir la palabra ELIMINAR.' });
      return;
    }

    const confirm = window.confirm('Esta acción es permanente. ¿Deseas continuar?');
    if (!confirm) return;

    try {
      setDeleting(true);
      await profileService.deleteAccount({
        contrasenaActual: deletePassword,
        confirmacion: deleteConfirmation.trim().toUpperCase(),
      });
      setFeedback({ type: 'success', message: 'Tu cuenta ha sido eliminada permanentemente.' });
      await logout();
      window.location.href = '/';
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? 'No se pudo eliminar la cuenta.' });
    } finally {
      setDeleting(false);
      resetDeleteForm();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 sm:p-6 md:p-7">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-red-700">Zona de peligro</h2>
          <p className="text-sm text-red-600/80">Acciones permanentes que impactan tu cuenta y datos.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-5 inline-flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-neutral-200 rounded-xl p-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Exportar mis datos</h3>
            <p className="text-xs text-neutral-500">Descarga un archivo con la información almacenada en tu perfil.</p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-70"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Exportar datos
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-neutral-200 rounded-xl p-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Desactivar cuenta temporalmente</h3>
            <p className="text-xs text-neutral-500">Puedes volver a activarla iniciando sesión nuevamente.</p>
          </div>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100 transition disabled:opacity-70"
          >
            {deactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Desactivar cuenta
          </button>
        </div>

        <form onSubmit={handleDelete} className="border border-red-300 rounded-xl p-4 bg-red-50 space-y-3">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">Eliminar cuenta permanentemente</h3>
          <p className="text-xs text-red-600">
            Esta acción no se puede deshacer. Se perderán tus datos, reservas y preferencias almacenadas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition"
            />
            <input
              type="text"
              placeholder="Escribe ELIMINAR para confirmar"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-600/90 disabled:opacity-70 transition"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Eliminar cuenta
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileDangerZone;
