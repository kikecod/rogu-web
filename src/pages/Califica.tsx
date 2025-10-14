import React, { useState } from "react";
import Footer from "../components/Footer";
import CalificacionEstrellas from "../components/CalificacionEstrellas";

const CalificaCPage: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Suponiendo que tienes un endpoint en tu backend
      // POST /api/calificaciones
      const response = await fetch("http://localhost:8080/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canchaId: 1, // ← reemplaza por el id real
          usuarioId: 2, // ← id del usuario logueado
          puntuacion: rating,
        }),
      });

      if (response.ok) setMensaje("¡Gracias por tu calificación!");
      else setMensaje("Error al enviar la calificación.");
    } catch (error) {
      setMensaje("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Califica la Cancha
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center"
        >
          <CalificacionEstrellas rating={rating} setRating={setRating} />
          <button
            type="submit"
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Enviar Calificación
          </button>
          {mensaje && <p className="mt-4 text-gray-700">{mensaje}</p>}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CalificaCPage;
