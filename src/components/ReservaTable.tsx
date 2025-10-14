// src/components/ReservaTable.tsx
import React, { useEffect, useState } from "react";
import ReservaDetalle from "./ReservaDetalle";
import { useNavigate } from "react-router-dom";

interface Reserva {
  id: number;
  numeroReserva: string;
  usuario: string;
  fecha: string;
  detalles?: any[];
}

const ReservaTable: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar reservas desde backend
    const fetchReservas = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/reservas");
        const data = await response.json();
        setReservas(data);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      }
    };
    fetchReservas();
  }, []);

  const handleDetalles = (id: number) => {
    setReservaSeleccionada(reservaSeleccionada === id ? null : id);
  };

  const handleEscanear = (id: number) => {
    navigate(`/escanear/${id}`); // luego puedes crear esta ruta
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left"># Reserva</th>
            <th className="p-2 text-left">Usuario</th>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <React.Fragment key={reserva.id}>
              <tr className="border-t">
                <td className="p-2">{reserva.numeroReserva}</td>
                <td className="p-2">{reserva.usuario}</td>
                <td className="p-2">{new Date(reserva.fecha).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleEscanear(reserva.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Escanear
                  </button>
                  <button
                    onClick={() => handleDetalles(reserva.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
              {reservaSeleccionada === reserva.id && (
                <tr>
                  <td colSpan={4}>
                    <ReservaDetalle reservaId={reserva.id} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservaTable;


