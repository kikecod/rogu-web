import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FieldManagement from '@/fields/components/FieldManagement';
import { ROUTES } from '@/config/routes';

const OwnerSpaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sede, setSede] = useState<{ idSede: number; nombre: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSede = async () => {
            if (!id) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // The API might return { sede: ... } or just the object depending on the endpoint
                    // Based on VenueManagement usage: detailData.sede
                    const sedeData = data.sede || data;
                    setSede({
                        idSede: sedeData.idSede,
                        nombre: sedeData.nombre
                    });
                } else {
                    console.error('Error fetching sede details');
                    navigate(ROUTES.owner.spaces);
                }
            } catch (error) {
                console.error('Error fetching sede:', error);
                navigate(ROUTES.owner.spaces);
            } finally {
                setLoading(false);
            }
        };

        fetchSede();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!sede) {
        return <div>No se encontró la sede.</div>;
    }

    return (
        <FieldManagement
            sede={sede}
            onBack={() => navigate(ROUTES.owner.spaces)}
        />
    );
};

export default OwnerSpaceDetailPage;
