// src/pages/ControladorPage.tsx
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import ReservaTable from "../components/ReservaTable";

interface Usuario {
  id: number;
  nombre: string;
}

const ControladorPage: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Simulación: traer datos del usuario logueado (controlador)
    // Esto luego debe venir del backend
    const fetchUsuario = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/usuarios/me");
        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    };
    fetchUsuario();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Bienvenido {usuario ? usuario.nombre : "Controlador"}
        </h1>

        <section className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Reservas recientes</h2>
          <ReservaTable />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ControladorPage;



