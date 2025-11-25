// src/modules/analytics/pages/ResenasPage.tsx

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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${idSede}`, {
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
        const sedesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede`, {
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
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= rating
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
      <div className="p-6 sm:p-8 lg:p-10 bg-slate-50 rounded-2xl min-h-[260px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-slate-500">Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <p className="text-red-800 text-lg font-semibold">Ups, algo salió mal</p>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadResenasData}
            className="mt-5 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl min-h-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 sm:px-7 sm:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Reseñas y Calificaciones
          </h1>
          <p className="text-sm sm:text-base text-gray-600 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
              Resumen general
            </span>
            {resenasData && (
              <span>
                {resenasData.resumen.totalResenas} reseñas • Rating promedio:{' '}
                <span className="font-semibold text-gray-900">
                  {resenasData.resumen.ratingPromedio.toFixed(1)}/5
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Selector de Cancha */}
        {canchas.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Filtrar por cancha:
            </label>
            <select
              value={selectedCanchaId || ''}
              onChange={(e) => setSelectedCanchaId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 shadow-sm"
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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Rating Promedio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rating Promedio
            </h3>
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-100">
              Clientes
            </span>
          </div>
          <div className="text-center space-y-3">
            <p className="text-5xl sm:text-6xl font-bold text-gray-900 leading-none">
              {resenasData?.resumen.ratingPromedio.toFixed(1)}
            </p>
            <div className="flex justify-center">
              {renderStars(resenasData?.resumen.ratingPromedio || 0)}
            </div>
            <p className="text-sm text-gray-600">
              Basado en{' '}
              <span className="font-medium text-gray-900">
                {resenasData?.resumen.totalResenas}
              </span>{' '}
              reseñas
            </p>
          </div>
        </div>

        {/* Distribución por estrellas */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Calificaciones
          </h3>
          <div className="space-y-3">
            {resenasData?.distribucion
              .sort((a, b) => b.estrellas - a.estrellas)
              .map((dist) => (
                <div key={dist.estrellas} className="flex items-center gap-3">
                  <div className="w-20 flex items-center justify-start">
                    <span className="text-sm font-medium text-gray-700 mr-1.5">
                      {dist.estrellas}
                    </span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className="relative w-full h-3.5 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${dist.porcentaje}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right text-xs sm:text-sm">
                    <span className="font-medium text-gray-900">
                      {dist.cantidad}
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({dist.porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Lista de reseñas */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Últimas Reseñas
          </h3>
          {resenasData && (
            <span className="text-xs text-slate-500">
              Mostrando las reseñas más recientes
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-200">
          {resenasData?.ultimasResenas.map((resena, index) => (
            <div
              key={index}
              className="p-5 sm:p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {resena.cliente.nombre} {resena.cliente.apellido}
                      {resena.cliente.apodo && (
                        <span className="ml-2 text-gray-500">
                          ({resena.cliente.apodo})
                        </span>
                      )}
                    </h4>
                    {renderStars(resena.puntaje)}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {resena.cancha.nombre} • {resena.sede.nombre}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  {new Date(resena.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {resena.comentario}
              </p>
            </div>
          ))}

          {resenasData?.ultimasResenas.length === 0 && (
            <div className="p-10 sm:p-12 text-center text-gray-500">
              <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">
                No hay reseñas disponibles por el momento
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResenasPage;
