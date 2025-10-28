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
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Cuenta y seguridad</h2>
      </div>

      {msg && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>{msg}</span>
        </div>
      )}
      {err && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
          <XCircle className="h-4 w-4" />
          <span>{err}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos básicos */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Correo</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block text-sm font-medium text-neutral-700 mb-1 mt-3">Usuario</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="button"
            onClick={onSaveBasic}
            disabled={savingBasic}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-70"
          >
            {savingBasic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nueva contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <label className="block text-sm font-medium text-neutral-700 mb-1 mt-3">Confirmar contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
          />
          <button
            type="button"
            onClick={onChangePassword}
            disabled={savingPwd}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white disabled:opacity-70"
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
