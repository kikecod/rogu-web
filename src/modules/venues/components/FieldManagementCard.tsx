import React from 'react';
import type { CanchaResumen } from '../types/venue-search.types';

interface FieldManagementCardProps {
    field: CanchaResumen;
    onClick?: () => void;
}

const FieldManagementCard: React.FC<FieldManagementCardProps> = ({ field, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer transform transition-transform hover:scale-105"
        >
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                {/* Field Photo */}
                <div className="h-48 overflow-hidden">
                    <img
                        src={field.fotos?.[0]?.urlFoto || '/placeholder-field.jpg'}
                        alt={field.nombre}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Field Info */}
                <div className="p-4">
                    {/* Field Name */}
                    <h3 className="font-bold text-gray-900 text-base mb-2">{field.nombre}</h3>

                    {/* Disciplines */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {field.disciplinas.slice(0, 2).map((disciplina) => (
                            <span
                                key={disciplina.idDisciplina}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                            >
                                {disciplina.nombre}
                            </span>
                        ))}
                        {field.disciplinas.length > 2 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{field.disciplinas.length - 2} más
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${field.estado === 'Disponible'
                                    ? 'bg-green-100 text-green-800'
                                    : field.estado === 'Mantenimiento'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {field.estado}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldManagementCard;
