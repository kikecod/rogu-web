import React, { useState } from 'react';
import { AlertTriangle, Archive, Loader2, CheckCircle2 } from 'lucide-react';
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
    <section className="bg-white rounded-2xl border border-red-200 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-md transition space-y-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-base sm:text-lg font-semibold text-red-700">Zona de peligro</h2>
        </div>
        <p className="text-sm text-red-600/80">
          Acciones permanentes que impactan tu cuenta y datos.
        </p>
      </header>

      {/* Feedback */}
      {feedback && (
        <div
          className={`inline-flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
          role={feedback.type === 'success' ? 'status' : 'alert'}
          aria-live={feedback.type === 'success' ? 'polite' : 'assertive'}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4" />
          )}
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Exportar datos */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">Exportar mis datos</h3>
            <p className="text-xs text-amber-700/80">
              Descarga un archivo con la información almacenada en tu perfil.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-white text-sm text-amber-800 hover:bg-amber-100 transition disabled:opacity-70"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Exportar datos
          </button>
        </div>

        {/* Desactivar cuenta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-800">Desactivar cuenta temporalmente</h3>
            <p className="text-xs text-blue-700/80">
              Puedes volver a activarla iniciando sesión nuevamente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-600/90 active:bg-blue-700 disabled:opacity-70 transition"
          >
            {deactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Desactivar cuenta
          </button>
        </div>

        {/* Eliminar cuenta */}
        <form onSubmit={handleDelete} className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wide">
              Eliminar cuenta permanentemente
            </h3>
            <p className="mt-1 text-xs text-red-700">
              Esta acción no se puede deshacer. Se perderán tus datos, reservas y preferencias almacenadas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-600/90 active:bg-red-700 disabled:opacity-70 transition"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Eliminar cuenta
          </button>
        </form>
      </div>
    </section>
  );
};

export default ProfileDangerZone;
