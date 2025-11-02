import React, { useState } from 'react';
import { Bell, Globe, Loader2, MoonStar, ToggleLeft } from 'lucide-react';
import type { UsuarioPreferencias } from '../types/profile.types';
import profileService from '../services/profileService';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

interface Props {
  preferencias: UsuarioPreferencias | null;
  onUpdated?: (preferencias: UsuarioPreferencias) => void;
}

const defaultPreferences: UsuarioPreferencias = {
  idPreferencias: 0,
  mostrarEmail: true,
  mostrarTelefono: false,
  perfilPublico: true,
  notificarReservas: true,
  notificarPromociones: true,
  notificarRecordatorios: true,
  idioma: 'es',
  zonaHoraria: 'America/La_Paz',
  modoOscuro: false,
  firmaReserva: null,
};

const ProfilePreferencesForm: React.FC<Props> = ({ preferencias, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [state, setState] = useState<UsuarioPreferencias>({
    ...defaultPreferences,
    ...(preferencias ?? {}),
  });

  const handleToggle = (key: keyof UsuarioPreferencias) => {
    setState((prev) => ({
      ...prev,
      [key]: !(prev as any)[key],
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    try {
      setSaving(true);
      const payload = {
        mostrarEmail: state.mostrarEmail,
        mostrarTelefono: state.mostrarTelefono,
        perfilPublico: state.perfilPublico,
        notificarReservas: state.notificarReservas,
        notificarPromociones: state.notificarPromociones,
        notificarRecordatorios: state.notificarRecordatorios,
        idioma: state.idioma,
        zonaHoraria: state.zonaHoraria,
        modoOscuro: state.modoOscuro,
        firmaReserva: state.firmaReserva ?? null,
      };
      const updated = await profileService.updatePreferences(payload);
      setState((prev) => ({ ...prev, ...updated }));
      setFeedback({ type: 'success', message: 'Preferencias guardadas correctamente.' });
      onUpdated?.(updated);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error?.message ?? 'No se pudieron guardar las preferencias.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-md transition space-y-5">
      {/* Header tipo card */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-sky-600" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Preferencias y privacidad</h2>
        </div>
        <p className="text-sm text-neutral-500">
          Controla la visibilidad de tus datos y cómo deseas recibir notificaciones.
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
            <Bell className="mt-0.5 h-4 w-4" />
          ) : (
            <ToggleLeft className="mt-0.5 h-4 w-4" />
          )}
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Privacidad */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Privacidad</h3>

          <ToggleSwitch
            label="Mostrar mi correo a otros usuarios"
            description="Permite que otros usuarios vean tu correo al interactuar contigo."
            checked={state.mostrarEmail}
            onChange={() => handleToggle('mostrarEmail')}
          />
          <ToggleSwitch
            label="Mostrar mi teléfono"
            description="Comparte tu número de teléfono en tu perfil."
            checked={state.mostrarTelefono}
            onChange={() => handleToggle('mostrarTelefono')}
          />
          <ToggleSwitch
            label="Permitir que mi perfil sea visible públicamente"
            description="Tu perfil será visible para otros usuarios y dueños de canchas."
            checked={state.perfilPublico}
            onChange={() => handleToggle('perfilPublico')}
          />
        </section>

        {/* Notificaciones */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Notificaciones</h3>

          <ToggleSwitch
            label="Recibir recordatorios de reservas"
            checked={state.notificarReservas}
            onChange={() => handleToggle('notificarReservas')}
          />
          <ToggleSwitch
            label="Recibir promociones y novedades"
            checked={state.notificarPromociones}
            onChange={() => handleToggle('notificarPromociones')}
          />
          <ToggleSwitch
            label="Recibir recordatorios de eventos"
            checked={state.notificarRecordatorios}
            onChange={() => handleToggle('notificarRecordatorios')}
          />
        </section>

        {/* Idioma / Zona horaria */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-neutral-600">
              <Globe className="h-3.5 w-3.5 text-neutral-400" />
              Idioma
            </label>
            <select
              name="idioma"
              value={state.idioma}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition bg-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600">
              Zona horaria
            </label>
            <select
              name="zonaHoraria"
              value={state.zonaHoraria}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition bg-white"
            >
              <option value="America/La_Paz">America/La_Paz (GMT-4)</option>
              <option value="America/Bogota">America/Bogota (GMT-5)</option>
              <option value="America/Santiago">America/Santiago (GMT-3)</option>
              <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
            </select>
          </div>
        </section>

        {/* Apariencia y firma */}
        <section className="space-y-3">
          <ToggleSwitch
            label="Activar modo oscuro"
            description="Aplicar tema oscuro automáticamente en la interfaz."
            icon={MoonStar}
            checked={state.modoOscuro}
            onChange={() => handleToggle('modoOscuro')}
          />
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600">
              Firma para reservas (opcional)
            </label>
            <textarea
              name="firmaReserva"
              rows={3}
              value={state.firmaReserva ?? ''}
              onChange={handleChange}
              placeholder="Ingresa un mensaje o firma que se adjuntará al confirmar tus reservas."
              className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium shadow-sm hover:bg-sky-600/90 disabled:opacity-70 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar preferencias
          </button>
        </div>
      </form>
    </section>
  );
};
interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

/* Toggle accesible y estilizado (misma API, solo UI) */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}) => (
  <label className="group flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition">
    <div className="flex-1">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
        {Icon ? <Icon className="h-4 w-4 text-neutral-400" /> : null}
        {label}
      </div>
      {description ? (
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      ) : null}
    </div>

    {/* Switch */}
    <span className="relative inline-flex h-7 w-12 items-center">
      {/* Checkbox accesible (peer) */}
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      {/* Track */}
      <span
        className="
          pointer-events-none absolute inset-0 rounded-full bg-neutral-200 ring-1 ring-neutral-300
          transition-all duration-300 ease-out
          peer-checked:bg-gradient-to-r peer-checked:from-sky-600 peer-checked:to-indigo-600 peer-checked:ring-sky-600
          peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/40
          [box-shadow:inset_0_1px_0_rgba(255,255,255,.6)]
        "
      />

      {/* Thumb */}
      <span
        className="
          pointer-events-none absolute left-0.5 h-6 w-6 rounded-full bg-white shadow
          transition-transform duration-300 ease-out will-change-transform
          peer-checked:translate-x-5
        "
      />

      {/* Sutileza: brillo al activar */}
      <span
        className="
          pointer-events-none absolute -inset-1 rounded-full opacity-0 transition-opacity duration-300
          peer-checked:opacity-20 peer-checked:bg-sky-400
        "
      />
    </span>
  </label>
);

export default ProfilePreferencesForm;
