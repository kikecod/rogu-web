// src/components/ReservaDetalle.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UsuarioReserva {
  id: number;
  nombre: string;
  ci: string;
}

interface ReservaDetalleProps {
  reservaId: number;
}

const ReservaDetalle: React.FC<ReservaDetalleProps> = ({ reservaId }) => {
  const [usuarios, setUsuarios] = useState<UsuarioReserva[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/reservas/${reservaId}/usuarios`
        );
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, [reservaId]);

  const handleDenunciar = (usuarioDenunciadoId: number) => {
    navigate(`/denuncia?denunciado=${usuarioDenunciadoId}&reserva=${reservaId}`);
  };

  return (
    <div className="bg-gray-50 border-t border-gray-300 p-3">
      <h3 className="font-semibold mb-2">Usuarios en esta reserva</h3>
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">CI</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.nombre}</td>
                <td className="p-2">{u.ci}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDenunciar(u.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Denunciar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center p-2 text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReservaDetalle;


