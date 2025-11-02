// ⭐ PÁGINA: Visualización de Reseñas y Calificaciones

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getResumenResenas } from '../services/analyticsService';
import type { ResumenResenasData } from '../types/analytics.types';

interface ResenasPageProps {
  idPersonaD?: number;
  idSede?: number;
  idCancha?: number;
}

const ResenasPage: React.FC<ResenasPageProps> = ({ 
  idPersonaD, 
  idSede, 
  idCancha 
}) => {
  const [resenasData, setResenasData] = useState<ResumenResenasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [selectedCanchaId, setSelectedCanchaId] = useState<number | undefined>(idCancha);

  useEffect(() => {
    loadCanchas();
  }, [idPersonaD, idSede]);

  useEffect(() => {
    loadResenasData();
  }, [idPersonaD, idSede, selectedCanchaId]);

  const loadCanchas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Si hay sede seleccionada, cargar solo canchas de esa sede
      if (idSede) {
        const response = await fetch(`http://localhost:3000/api/sede/${idSede}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const sedeData = await response.json();
          setCanchas(sedeData.canchas || []);
        }
      } else if (idPersonaD) {
        // Si no hay sede pero hay dueño, cargar todas las sedes del dueño y sus canchas
        const sedesResponse = await fetch('http://localhost:3000/api/sede', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (sedesResponse.ok) {
          const allSedes = await sedesResponse.json();
          const mySedes = allSedes.filter((s: any) => s.idPersonaD === idPersonaD);
          
          // Obtener todas las canchas de mis sedes
          const todasLasCanchas: any[] = [];
          for (const sede of mySedes) {
            if (sede.canchas && sede.canchas.length > 0) {
              todasLasCanchas.push(...sede.canchas);
            }
          }
          setCanchas(todasLasCanchas);
        }
      }
    } catch (err) {
      console.error('Error loading canchas:', err);
    }
  };

  const loadResenasData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResumenResenas({ 
        idPersonaD, 
        idSede, 
        idCancha: selectedCanchaId 
      });
      setResenasData(data);
    } catch (err) {
      setError('Error al cargar las reseñas');
      console.error('Error loading resenas:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadResenasData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reseñas y Calificaciones</h1>
          <p className="text-gray-600 mt-1">
            {resenasData?.resumen.totalResenas} reseñas • Rating promedio: {resenasData?.resumen.ratingPromedio.toFixed(1)}/5
          </p>
        </div>

        {/* Selector de Cancha */}
        {canchas.length > 0 && (
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Filtrar por cancha:</label>
            <select
              value={selectedCanchaId || ''}
              onChange={(e) => setSelectedCanchaId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las canchas</option>
              {canchas.map((cancha) => (
                <option key={cancha.idCancha} value={cancha.idCancha}>
                  {cancha.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resumen de Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Promedio */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Promedio</h3>
          <div className="text-center">
            <p className="text-6xl font-bold text-gray-900 mb-2">
              {resenasData?.resumen.ratingPromedio.toFixed(1)}
            </p>
            <div className="flex justify-center mb-2">
              {renderStars(resenasData?.resumen.ratingPromedio || 0)}
            </div>
            <p className="text-sm text-gray-600">
              Basado en {resenasData?.resumen.totalResenas} reseñas
            </p>
          </div>
        </div>

        {/* Distribución por estrellas */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Calificaciones</h3>
          <div className="space-y-3">
            {resenasData?.distribucion.sort((a, b) => b.estrellas - a.estrellas).map((dist) => (
              <div key={dist.estrellas} className="flex items-center">
                <div className="w-20 flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">{dist.estrellas}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${dist.porcentaje}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-gray-900">{dist.cantidad}</span>
                  <span className="text-sm text-gray-500 ml-2">({dist.porcentaje.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Últimas Reseñas</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {resenasData?.ultimasResenas.map((resena, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 mr-3">
                      {resena.cliente.nombre} {resena.cliente.apellido}
                      {resena.cliente.apodo && (
                        <span className="ml-2 text-gray-500">({resena.cliente.apodo})</span>
                      )}
                    </h4>
                    {renderStars(resena.puntaje)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {resena.cancha.nombre} • {resena.sede.nombre}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(resena.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <p className="text-gray-700">{resena.comentario}</p>
            </div>
          ))}

          {resenasData?.ultimasResenas.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay reseñas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResenasPage;
