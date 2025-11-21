import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuarios.service';
import type { Usuario, ListaUsuariosParams, TipoRol, EstadoUsuario } from '../../types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [paginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState<ListaUsuariosParams>({
    page: 1,
    limit: 20,
  });

  const cargarUsuarios = async (nuevosFiltros?: ListaUsuariosParams) => {
    try {
      setLoading(true);
      setError(null);
      const filtrosAUsar = nuevosFiltros || filtros;
      const response = await usuariosService.getAll(filtrosAUsar);
      setUsuarios(response.usuarios);
      setTotal(response.total);
      setTotalPaginas(response.paginas);
      if (nuevosFiltros) {
        setFiltros(filtrosAUsar);
      }
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const aplicarFiltros = (nuevosFiltros: Partial<ListaUsuariosParams>) => {
    const filtrosActualizados = {
      ...filtros,
      ...nuevosFiltros,
      page: nuevosFiltros.page || 1, // Resetear a página 1 al cambiar filtros (excepto si se especifica)
    };
    cargarUsuarios(filtrosActualizados);
  };

  const cambiarPagina = (page: number) => {
    aplicarFiltros({ page });
  };

  const buscar = (termino: string) => {
    aplicarFiltros({ buscar: termino, page: 1 });
  };

  const filtrarPorRol = (rol?: TipoRol) => {
    aplicarFiltros({ rol, page: 1 });
  };

  const filtrarPorEstado = (estado?: EstadoUsuario) => {
    aplicarFiltros({ estado, page: 1 });
  };

  const refrescar = () => {
    cargarUsuarios(filtros);
  };

  return {
    usuarios,
    loading,
    error,
    total,
    paginas,
    filtros,
    aplicarFiltros,
    cambiarPagina,
    buscar,
    filtrarPorRol,
    filtrarPorEstado,
    refrescar,
  };
};
