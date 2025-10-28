import React, { useState } from 'react';
import { Shield, Save, KeyRound, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { UsuarioProfile } from '../../../../features/profile/types';
import profileService from '../../../../features/profile/services/profile.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';

interface Props {
  usuario: UsuarioProfile;
}

const ProfileAccountSettings: React.FC<Props> = ({ usuario }) => {
  const { updateUser } = useAuth();
  const [email, setEmail] = useState(usuario.correo);
  const [username, setUsername] = useState(usuario.usuario);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const resetAlerts = () => { setMsg(null); setErr(null); };

  const onSaveBasic = async () => {
    resetAlerts();
    if (!email || !username) { setErr('Correo y usuario son requeridos'); return; }
    try {
      setSavingBasic(true);
      await profileService.updateUserBasic({ id_usuario: usuario.id_usuario, correo: email, usuario: username });
      // adaptar a tipo User del AuthContext (avatar?: string)
      updateUser({
        correo: email,
        usuario: username,
        id_persona: usuario.id_persona,
        id_usuario: usuario.id_usuario,
        roles: usuario.roles,
        avatar: usuario.avatar ?? undefined,
      });
      setMsg('Datos actualizados');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo actualizar');
    } finally {
      setSavingBasic(false);
    }
  };

  const onChangePassword = async () => {
    resetAlerts();
    if (!pwd || pwd.length < 8 || pwd.length > 20) { setErr('La contraseña debe tener entre 8 y 20 caracteres'); return; }
    if (pwd !== pwd2) { setErr('Las contraseñas no coinciden'); return; }
    try {
      setSavingPwd(true);
      await profileService.changePassword({ id_usuario: usuario.id_usuario, nuevaContrasena: pwd });
      setPwd(''); setPwd2('');
      setMsg('Contraseña actualizada');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-5 sm:p-6 md:p-7 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <Shield className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Cuenta y seguridad</h2>
      </div>

      {msg && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200" role="status" aria-live="polite">
          <CheckCircle2 className="h-4 w-4" />
          <span className="break-words">{msg}</span>
        </div>
      )}
      {err && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200" role="alert" aria-live="assertive">
          <XCircle className="h-4 w-4" />
          <span className="break-words">{err}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Datos básicos */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-sm">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Correo</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block text-sm font-medium text-neutral-700 mb-1 mt-3">Usuario</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="button"
            onClick={onSaveBasic}
            disabled={savingBasic}
            className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-600/90 active:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {savingBasic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-sm">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nueva contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <label className="block text-sm font-medium text-neutral-700 mb-1 mt-3">Confirmar contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
          />
          <button
            type="button"
            onClick={onChangePassword}
            disabled={savingPwd}
            className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white shadow-sm hover:bg-amber-600/90 active:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountSettings;
