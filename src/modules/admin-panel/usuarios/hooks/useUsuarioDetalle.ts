import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuarios.service';
import type { UsuarioDetalle, ActualizarUsuarioDto, TipoRol } from '../../types';

export const useUsuarioDetalle = (id: number) => {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getById(id);
      console.log('🎯 DATOS EN HOOK useUsuarioDetalle:', data);
      console.log('🎯 PERSONA EN HOOK:', data.persona);
      setUsuario(data);
    } catch (err: any) {
      console.error('Error al cargar usuario:', err);
      setError(err.response?.data?.message || 'Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarUsuario();
    }
  }, [id]);

  const actualizar = async (data: ActualizarUsuarioDto) => {
    try {
      setActualizando(true);
      setError(null);
      const usuarioActualizado = await usuariosService.actualizar(id, data);
      setUsuario(usuarioActualizado);
      return { success: true, data: usuarioActualizado };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActualizando(false);
    }
  };

  const modificarRoles = async (roles: TipoRol[]) => {
    try {
      setActualizando(true);
      setError(null);
      await usuariosService.actualizar(id, { roles });
      await cargarUsuario(); // Recargar para obtener datos actualizados
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al modificar roles';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActualizando(false);
    }
  };

  const cambiarEstado = async (estado: string) => {
    try {
      setActualizando(true);
      setError(null);
      await usuariosService.actualizar(id, { estado } as any);
      await cargarUsuario();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cambiar estado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActualizando(false);
    }
  };

  const eliminar = async (motivo: string) => {
    try {
      setActualizando(true);
      setError(null);
      await usuariosService.eliminar(id, motivo);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActualizando(false);
    }
  };

  const reactivar = async (motivo: string) => {
    try {
      setActualizando(true);
      setError(null);
      await usuariosService.reactivar(id, motivo);
      await cargarUsuario();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al reactivar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActualizando(false);
    }
  };

  const refrescar = () => {
    cargarUsuario();
  };

  return {
    usuario,
    loading,
    error,
    actualizando,
    actualizar,
    modificarRoles,
    cambiarEstado,
    eliminar,
    reactivar,
    refrescar,
  };
};
