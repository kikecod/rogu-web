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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-5 sm:p-6 md:p-7 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="h-5 w-5 text-sky-600" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Preferencias y privacidad</h2>
          <p className="text-sm text-neutral-500">Controla la visibilidad de tus datos y cómo deseas recibir notificaciones.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-5 inline-flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <Bell className="mt-0.5 h-4 w-4" /> : <ToggleLeft className="mt-0.5 h-4 w-4" />}
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Privacidad</h3>
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

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Notificaciones</h3>
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-neutral-400" />
              Idioma
            </label>
            <select
              name="idioma"
              value={state.idioma}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">Zona horaria</label>
            <select
              name="zonaHoraria"
              value={state.zonaHoraria}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
            >
              <option value="America/La_Paz">America/La_Paz (GMT-4)</option>
              <option value="America/Bogota">America/Bogota (GMT-5)</option>
              <option value="America/Santiago">America/Santiago (GMT-3)</option>
              <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
            </select>
          </div>
        </section>

        <section className="space-y-3">
          <ToggleSwitch
            label="Activar modo oscuro"
            description="Aplicar tema oscuro automáticamente en la interfaz."
            icon={MoonStar}
            checked={state.modoOscuro}
            onChange={() => handleToggle('modoOscuro')}
          />
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">
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
    </div>
  );
};

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

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, checked, onChange, icon: Icon }) => (
  <label className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-300 transition cursor-pointer">
    <div className="flex-1">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        {Icon ? <Icon className="h-4 w-4 text-neutral-400" /> : null}
        {label}
      </div>
      {description ? <p className="mt-0.5 text-xs text-neutral-500">{description}</p> : null}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-5 w-10 rounded-full border-neutral-300 text-sky-600 focus:ring-sky-500"
    />
  </label>
);

export default ProfilePreferencesForm;
