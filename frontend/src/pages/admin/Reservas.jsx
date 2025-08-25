import React from 'react';

export default function AdminReservas() {
  const [reservas, setReservas] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reservas`);
      const data = await res.json();
      setReservas(data);
    } catch (e) { console.error(e); setMsg('Error cargando reservas'); }
    setLoading(false);
  };

  React.useEffect(() => { fetchReservas(); }, []);

  const patch = async (id, action) => {
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/reservas/${id}/${action}`, { method: 'PATCH', headers: { 'x-admin-secret': ADMIN_SECRET } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg('Acción completada');
      fetchReservas();
    } catch (err) { setMsg(err.message || 'Error'); }
  };

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Panel Admin — Reservas</h2>
      {msg && <div className="mb-3 text-red-600">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="min-w-full bg-white">
          <thead><tr><th>ID</th><th>Nombre</th><th>Alojamiento</th><th>Fechas</th><th>Status</th><th>Acciones</th></tr></thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r._id} className="border-t">
                <td className="px-2 py-1 text-sm">{r._id}</td>
                <td className="px-2 py-1">{r.name}</td>
                <td className="px-2 py-1">{r.alojamientoId}</td>
                <td className="px-2 py-1">{new Date(r.checkIn).toISOString().slice(0,10)} → {new Date(r.checkOut).toISOString().slice(0,10)}</td>
                <td className="px-2 py-1">{r.status}</td>
                <td className="px-2 py-1">
                  {r.status !== 'confirmed' && <button className="mr-2 px-2 py-1 bg-green-600 text-white rounded" onClick={() => patch(r._id, 'confirm')}>Confirmar</button>}
                  {r.status !== 'cancelled' && <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => patch(r._id, 'cancel')}>Cancelar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
