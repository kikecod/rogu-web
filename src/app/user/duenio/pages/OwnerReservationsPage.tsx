import React from 'react';
import { useAuth } from '../../../../features/auth/context/AuthContext';
// import { ROUTE_PATHS } from '../../../../constants';
import { getReservasPorDuenio } from '../../../../features/reservas/services/reserva.service';
import { canchaService } from '../../../../features/canchas/services/cancha.service';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

interface OwnerReservaItem {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada' | string;
  canchaNombre: string;
  canchaId: number;
  sedeNombre: string;
  direccion: string;
  clienteNombre: string;
  cantidadPersonas: number;
  participantes?: string[];
}

const OwnerReservationsPage: React.FC = () => {
  const { user, isLoggedIn, isDuenio } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<OwnerReservaItem[]>([]);
  const [summary, setSummary] = React.useState<{ total: number; activas: number; completadas: number; canceladas: number }>({ total: 0, activas: 0, completadas: 0, canceladas: 0 });
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [canchaFilter, setCanchaFilter] = React.useState<number | 'all'>('all');
  const [sedeFilter, setSedeFilter] = React.useState<string | 'all'>('all');
  const [groupBy, setGroupBy] = React.useState<'none' | 'sede' | 'cancha'>('none');

  React.useEffect(() => {
    const load = async () => {
      if (!isLoggedIn || !isDuenio() || !user) { setLoading(false); return; }
      try {
        // 1) Traer reservas del dueño
  const resp = await getReservasPorDuenio(user.id_persona);
        const reservas = Array.isArray(resp?.reservas) ? resp.reservas : [];
  setSummary({ total: Number(resp?.total || 0), activas: Number(resp?.activas || 0), completadas: Number(resp?.completadas || 0), canceladas: Number(resp?.canceladas || 0) });

        // 2) Construir un cache de canchas para evitar múltiples requests
        const uniqueCanchaIds = Array.from(new Set(reservas.map(r => r.id_cancha)));
        const canchaMap = new Map<number, { nombre: string; sedeNombre: string; direccion: string }>();
        for (const id of uniqueCanchaIds) {
          try {
            const c = await canchaService.getById(id);
            const sedeNombre = (c as any).sede?.nombre || 'Sede';
            const direccion = (c as any).sede?.direccion || '';
            canchaMap.set(id, { nombre: (c as any).nombre || `Cancha ${id}`, sedeNombre, direccion });
          } catch {
            canchaMap.set(id, { nombre: `Cancha ${id}`, sedeNombre: 'Sede', direccion: '' });
          }
        }

        // 3) Mapear a items UI
        const mapped: OwnerReservaItem[] = reservas.map((r: any) => {
          const canchaInfo = canchaMap.get(r.id_cancha) || { nombre: `Cancha ${r.id_cancha}`, sedeNombre: 'Sede', direccion: '' };
          const inicio = new Date(r.inicia_en);
          const fin = new Date(r.termina_en);
          const clienteNombre = r.cliente?.persona
            ? `${r.cliente.persona.nombres ?? ''} ${r.cliente.persona.paterno ?? ''}`.trim()
            : `Cliente ${r.id_cliente}`;
          const participantes: string[] = Array.isArray(r.participantes)
            ? r.participantes.map((p: any) => p?.persona ? `${p.persona.nombres ?? ''} ${p.persona.paterno ?? ''}`.trim() : `Cliente ${p.id_cliente}`)
            : [];
          return {
            id: r.id_reserva,
            fecha: inicio.toLocaleDateString('es-ES'),
            horaInicio: inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            horaFin: fin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estado: r.estado,
            canchaNombre: canchaInfo.nombre,
            canchaId: Number(r.id_cancha),
            sedeNombre: canchaInfo.sedeNombre,
            direccion: canchaInfo.direccion,
            clienteNombre,
            cantidadPersonas: Number(r.cantidad_personas || 1),
            participantes
          };
        });

        setItems(mapped);
      } catch (err) {
        console.error('Error cargando reservas del dueño:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoggedIn, user?.id_persona]);

  const uniqueCanchas = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(`${i.canchaId}|${i.canchaNombre}`));
    return Array.from(set).map(s => {
      const [id, nombre] = s.split('|');
      return { id: Number(id), nombre };
    });
  }, [items]);

  const uniqueSedes = React.useMemo(() => {
    return Array.from(new Set(items.map(i => i.sedeNombre))).filter(Boolean);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    return items.filter(i => {
      const bucket = i.estado === 'Cancelada' ? 'cancelled' : (i.estado === 'Completada' ? 'completed' : 'active');
      const statusOk = statusFilter === 'all' || bucket === statusFilter;
      const canchaOk = canchaFilter === 'all' || i.canchaId === canchaFilter;
      const sedeOk = sedeFilter === 'all' || i.sedeNombre === sedeFilter;
      return statusOk && canchaOk && sedeOk;
    });
  }, [items, statusFilter, canchaFilter, sedeFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold">Reservas de mis canchas</h1>
          <p className="text-indigo-100 mt-1">Revisa quién reservó, cuándo y quiénes asistirán</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow border border-indigo-100">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-3xl font-extrabold text-indigo-700">{summary.total}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border border-green-100">
            <div className="text-sm text-gray-600">Activas</div>
            <div className="text-3xl font-extrabold text-green-700">{summary.activas}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border border-blue-100">
            <div className="text-sm text-gray-600">Completadas</div>
            <div className="text-3xl font-extrabold text-blue-700">{summary.completadas}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border border-red-100">
            <div className="text-sm text-gray-600">Canceladas</div>
            <div className="text-3xl font-extrabold text-red-700">{summary.canceladas}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow border mb-6">
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-24">Estado</span>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border rounded px-3 py-2 text-sm">
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-24">Cancha</span>
              <select value={canchaFilter === 'all' ? 'all' : String(canchaFilter)} onChange={e => setCanchaFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="border rounded px-3 py-2 text-sm min-w-48">
                <option value="all">Todas</option>
                {uniqueCanchas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-24">Sede</span>
              <select value={sedeFilter} onChange={e => setSedeFilter(e.target.value as any)} className="border rounded px-3 py-2 text-sm min-w-48">
                <option value="all">Todas</option>
                {uniqueSedes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-24">Agrupar</span>
              <select value={groupBy} onChange={e => setGroupBy(e.target.value as any)} className="border rounded px-3 py-2 text-sm min-w-48">
                <option value="none">Sin agrupación</option>
                <option value="sede">Por sede</option>
                <option value="cancha">Por cancha</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Cargando reservas...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-600 bg-white p-8 rounded-xl shadow">No hay reservas aún.</div>
        ) : (
          groupBy === 'none' ? (
            <div className="space-y-4">
              {filteredItems.map((it) => (
                <div key={it.id} className="bg-white rounded-xl shadow border p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold">{it.canchaNombre}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="h-4 w-4" /> {it.sedeNombre} · {it.direccion}</div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {it.fecha}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {it.horaInicio} - {it.horaFin}</div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {it.cantidadPersonas} personas</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {it.estado === 'Cancelada' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full"><XCircle className="h-4 w-4"/> Cancelada</span>
                      ) : it.estado === 'Completada' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"><CheckCircle className="h-4 w-4"/> Completada</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full"><CheckCircle className="h-4 w-4"/> Activa</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold">Cliente titular</div>
                    <div className="text-gray-800">{it.clienteNombre}</div>
                    {it.participantes && it.participantes.length > 0 && (
                      <div className="mt-2">
                        <div className="font-semibold">Participantes invitados</div>
                        <ul className="list-disc pl-5 text-gray-800">
                          {it.participantes.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                filteredItems.reduce((acc: Record<string, OwnerReservaItem[]>, it) => {
                  const key = groupBy === 'sede' ? it.sedeNombre : it.canchaNombre;
                  acc[key] = acc[key] || [];
                  acc[key].push(it);
                  return acc;
                }, {})
              ).map(([group, items]) => (
                <div key={group}>
                  <div className="text-lg font-bold mb-2">{group}</div>
                  <div className="space-y-4">
                    {items.map((it) => (
                      <div key={it.id} className="bg-white rounded-xl shadow border p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <div className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="h-4 w-4" /> {it.sedeNombre} · {it.direccion}</div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {it.fecha}</div>
                              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {it.horaInicio} - {it.horaFin}</div>
                              <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {it.cantidadPersonas} personas</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {it.estado === 'Cancelada' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full"><XCircle className="h-4 w-4"/> Cancelada</span>
                            ) : it.estado === 'Completada' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"><CheckCircle className="h-4 w-4"/> Completada</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full"><CheckCircle className="h-4 w-4"/> Activa</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                          <div className="font-semibold">Cliente titular</div>
                          <div className="text-gray-800">{it.clienteNombre}</div>
                          {it.participantes && it.participantes.length > 0 && (
                            <div className="mt-2">
                              <div className="font-semibold">Participantes invitados</div>
                              <ul className="list-disc pl-5 text-gray-800">
                                {it.participantes.map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OwnerReservationsPage;
