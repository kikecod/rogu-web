import React from 'react';
import { MapPin, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { getImageUrl } from '@/core/config/api';

// Define a local interface or import the one from VenueManagement if possible, 
// but for a standalone component it's often better to define props clearly.
// We'll try to match the shape of the data we have in VenueManagement.

export interface VenueCardProps {
    sede: {
        idSede: number;
        nombre: string;
        descripcion: string;
        city?: string;
        stateProvince?: string;
        direccion?: string;
        addressLine?: string;
        estado: string;
        verificada?: boolean;
        canchas?: any[];
        // We might not have photos in the basic list response, but let's support it if added
        fotos?: { urlFoto: string }[];
        fotoPrincipal?: string;
    };
    onClick: () => void;
}

const VenueManagementCard: React.FC<VenueCardProps> = ({ sede, onClick }) => {
    const {
        nombre,
        city,
        stateProvince,
        direccion,
        addressLine,
        estado,
        verificada,
        canchas,
        fotos,
        fotoPrincipal
    } = sede;

    // Image handling
    const imagenPath = fotoPrincipal || fotos?.[0]?.urlFoto;
    const imagenPrincipal = imagenPath
        ? (imagenPath.startsWith('http') ? imagenPath : getImageUrl(imagenPath))
        : '/placeholder-venue.jpg';

    const isActive = estado === 'Activo';
    const courtCount = canchas?.length || 0;
    const location = city && stateProvince ? `${city}, ${stateProvince}` : (addressLine || direccion || 'Sin ubicación');

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-blue-500 flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                    src={imagenPrincipal}
                    alt={nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-venue.jpg';
                    }}
                />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                {/* Verification Badge */}
                {verificada && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                        <CheckCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Verificada</span>
                    </div>
                )}

                {!verificada && verificada !== undefined && (
                    <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                        <AlertCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Pendiente</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {nombre}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{location}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-gray-700 font-medium">
                        <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{courtCount} {courtCount === 1 ? 'Cancha' : 'Canchas'}</span>
                    </div>

                    <span className="text-xs text-blue-600 font-medium group-hover:underline">
                        Ver detalles
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VenueManagementCard;
