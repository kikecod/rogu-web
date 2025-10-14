import React from "react";
import DenunciaForm from "../components/DenunciaForm";
import Footer from "../components/Footer";

const DenunciaPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Formulario de Denuncia
        </h1>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <DenunciaForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DenunciaPage;
