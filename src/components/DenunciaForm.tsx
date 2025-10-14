import React, { useState } from "react";

const DenunciaForm: React.FC = () => {
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          denuncianteId: 1, // ← reemplaza con el id real del usuario logueado
          denunciadoId: 2, // ← el id del usuario denunciado (puede venir por props)
          motivo,
          detalle,
        }),
      });

      if (response.ok) {
        setMensaje("Denuncia enviada correctamente.");
        setMotivo("");
        setDetalle("");
      } else {
        setMensaje("Error al enviar la denuncia.");
      }
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="font-semibold text-gray-700">Motivo:</label>
      <input
        type="text"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        required
        className="border border-gray-300 rounded-lg p-2 focus:outline-blue-500"
      />

      <label className="font-semibold text-gray-700">Detalle:</label>
      <textarea
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={4}
        required
        className="border border-gray-300 rounded-lg p-2 focus:outline-blue-500"
      />

      <button
        type="submit"
        className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
      >
        Enviar Denuncia
      </button>

      {mensaje && <p className="text-center text-gray-700">{mensaje}</p>}
    </form>
  );
};

export default DenunciaForm;
