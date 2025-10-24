import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchReservasBySede, fetchParticipantesByReserva } from '../utils/helpers';
import QrScannerModal from '../components/QrScannerModal';

// Tipos basados en tu backend
interface Reserva {
  idReserva: number;
  cliente: {
    idCliente: number;
    persona: {
      nombres: string;
      paterno: string;
      materno?: string;
    };
  };
  cancha: {
    sede: {
      idSede: number;
      nombreSede: string;
    };
  };
  fechaInicio: string; // campo real en BD
}

interface Participante {
  idCliente: number;
  persona: {
    nombres: string;
    paterno: string;
    documentoNumero: string;
  };
}

const ControladorDashboard = () => {
  const { user } = useAuth(); // user.idPersona = persona del controlador
  const navigate = useNavigate();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [showDetails, setShowDetails] = useState<Record<number, boolean>>({});
  const [participantes, setParticipantes] = useState<Record<number, Participante[]>>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [controladorInfo, setControladorInfo] = useState<{ nombres: string; sedeNombre: string } | null>(null);

  // 🟢 Carga inicial: datos del controlador y reservas
  useEffect(() => {
    const fetchControladorData = async () => {
      try {
        // obtener datos del controlador desde el backend
        const token = localStorage.getItem('token');
        const resp = await fetch(`/api/controladores/${user?.idPersona}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error('Error al obtener datos del controlador');

        const data = await resp.json();
        setControladorInfo({
          nombres: `${data.persona.nombres} ${data.persona.paterno}`,
          sedeNombre: data.sede?.nombreSede || 'Sin sede',
        });

        // cargar reservas de esa sede
        if (data.sede?.idSede) {
          const reservasData = await fetchReservasBySede(String(data.sede.idSede));
          // Type from helper is ApiReserva[]; assert it's compatible with Reserva[]
          setReservas(reservasData as unknown as Reserva[]);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del controlador:', error);
      }
    };

    if (user?.idPersona) fetchControladorData();
  }, [user?.idPersona]);

  // 🟣 Alternar detalles (acordeón)
  const toggleDetails = async (idReserva: number) => {
    const alreadyOpen = showDetails[idReserva];
    setShowDetails((prev) => ({ ...prev, [idReserva]: !alreadyOpen }));

    if (!alreadyOpen && !participantes[idReserva]) {
      try {
        const data = await fetchParticipantesByReserva(String(idReserva));
        setParticipantes((prev) => ({ ...prev, [idReserva]: data }));
      } catch (err) {
        console.error('Error al cargar participantes:', err);
      }
    }
  };

  // 🟡 Abrir escáner QR
  const openScanner = (idReserva: number) => {
    setSelectedReservaId(idReserva);
    setScannerOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Bienvenido, {controladorInfo?.nombres || 'Controlador'}
        </h1>
        <p className="text-gray-600 mt-2 sm:mt-0">
          Sede: {controladorInfo?.sedeNombre || 'No asignada'}
        </p>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-4 py-2">Número de Reserva</th>
            <th className="border px-4 py-2">Cliente</th>
            <th className="border px-4 py-2">Fecha</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No hay reservas disponibles
              </td>
            </tr>
          ) : (
            reservas.map((res) => (
              <Fragment key={res.idReserva}>
                <tr>
                  <td className="border px-4 py-2">{res.idReserva}</td>
                  <td className="border px-4 py-2">
                    {res.cliente?.persona?.nombres} {res.cliente?.persona?.paterno}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(res.fechaInicio).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openScanner(res.idReserva)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Escanear
                    </button>
                    <button
                      onClick={() => toggleDetails(res.idReserva)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>

                {showDetails[res.idReserva] && (
                  <tr>
                    <td colSpan={4} className="border px-4 py-2">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="border px-4 py-2">Nombre</th>
                            <th className="border px-4 py-2">CI</th>
                            <th className="border px-4 py-2">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(participantes[res.idReserva] || []).map((p) => (
                            <tr key={p.idCliente}>
                              <td className="border px-4 py-2">
                                {p.persona?.nombres} {p.persona?.paterno}
                              </td>
                              <td className="border px-4 py-2">
                                {p.persona?.documentoNumero}
                              </td>
                              <td className="border px-4 py-2">
                                <button
                                  onClick={() => navigate(`/denuncia/${p.idCliente}`)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                >
                                  Denunciar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de escáner */}
      {scannerOpen && selectedReservaId && (
        <QrScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          idReserva={selectedReservaId}
          idPersonaOpe={user?.idPersona}
          
        />
      )}
    </div>
  );
};

export default ControladorDashboard;
