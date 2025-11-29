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

  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;

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
        message: 'Se genero la exportacion de tus datos. Revisa tu carpeta de descargas.',
      });
    } catch (error: unknown) {
      setFeedback({ type: 'error', message: errorMessage(error, 'No se pudo exportar la informacion.') });
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivate = async () => {
    setFeedback(null);
    const confirm = window.confirm(
      'Seguro que deseas desactivar temporalmente tu cuenta? Podras reactivarla iniciando sesion nuevamente.',
    );
    if (!confirm) return;

    try {
      setDeactivating(true);
      await profileService.deactivateAccount({});
      setFeedback({
        type: 'success',
        message: 'Tu cuenta ha sido desactivada. Cerraremos la sesion por seguridad.',
      });
      await logout();
      window.location.href = '/';
    } catch (error: unknown) {
      setFeedback({ type: 'error', message: errorMessage(error, 'No se pudo desactivar la cuenta.') });
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!deletePassword || deleteConfirmation.trim().toUpperCase() !== 'ELIMINAR') {
      setFeedback({ type: 'error', message: 'Debes ingresar tu contrasena y escribir la palabra ELIMINAR.' });
      return;
    }

    const confirm = window.confirm('Esta accion es permanente. Deseas continuar?');
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
    } catch (error: unknown) {
      setFeedback({ type: 'error', message: errorMessage(error, 'No se pudo eliminar la cuenta.') });
    } finally {
      setDeleting(false);
      resetDeleteForm();
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-red-200 bg-white text-slate-900 shadow-lg shadow-red-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,113,113,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.08),transparent_35%)]" />
      <div className="relative space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-slate-900">Zona de peligro</h2>
          </div>
          <p className="text-sm text-red-600/80">Acciones criticas sobre tu cuenta y datos.</p>
        </header>

        {feedback && (
          <div
            className={`inline-flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
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

        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Exportar mis datos</h3>
              <p className="text-xs text-slate-600">Descarga un archivo con la informacion almacenada en tu perfil.</p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Exportar datos
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Desactivar cuenta temporalmente</h3>
              <p className="text-xs text-indigo-900/80">Puedes volver a activarla iniciando sesion nuevamente.</p>
            </div>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {deactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Desactivar cuenta
            </button>
          </div>

          <form onSubmit={handleDelete} className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-800">
                Eliminar cuenta permanentemente
              </h3>
              <p className="mt-1 text-xs text-red-700">
                Esta accion no se puede deshacer. Se perderan tus datos, reservas y preferencias almacenadas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="password"
                placeholder="Contrasena actual"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-900 placeholder:text-red-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300/60"
              />
              <input
                type="text"
                placeholder="Escribe ELIMINAR para confirmar"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm uppercase text-red-900 placeholder:text-red-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300/60"
              />
            </div>

            <button
              type="submit"
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Eliminar cuenta
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfileDangerZone;
