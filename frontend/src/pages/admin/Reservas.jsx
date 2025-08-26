import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import AdminAlojamientos from './Alojamientos';
import AdminUsuarios from './Usuarios';
import AdminBloqueos from './Bloqueos';


export default function AdminReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', alojamiento: '', desde: '', hasta: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [tab, setTab] = useState('reservas');
  const [alojamientos, setAlojamientos] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

  // onNav que pasa al Header dentro del admin: navegar a home o scroll cuando aplique
  const onNav = (section) => {
    if (section === 'home') {
      navigate('/');
      return;
    }
    // navegar a home y luego intentar hacer scroll a la sección si existe
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

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
  React.useEffect(() => {
    fetch(`${API_BASE}/alojamientos`).then(r=>r.json()).then(setAlojamientos);
  }, []);

  const patch = async (id, action) => {
    setMsg(null);
    try {
  const { fetchAuth } = await import('../../services/api');
  const res2 = await fetchAuth(`${API_BASE}/reservas/${id}/${action}`, { method: 'PATCH' });
  const data2 = await res2.json();
  if (!res2.ok) throw new Error(data2.error || 'Error');
      setMsg('Acción completada');
      fetchReservas();
    } catch (err) { setMsg(err.message || 'Error'); }
  };

  // Filtros y exportación CSV
  const filtrar = r => {
    if (filtros.estado && r.status !== filtros.estado) return false;
    if (filtros.alojamiento && r.alojamientoId !== filtros.alojamiento) return false;
    if (filtros.desde && new Date(r.checkIn) < new Date(filtros.desde)) return false;
    if (filtros.hasta && new Date(r.checkOut) > new Date(filtros.hasta)) return false;
    return true;
  };
  const reservasFiltradas = reservas.filter(filtrar);

  function exportarCSV() {
    const rows = [
      ['ID','Nombre','Alojamiento','CheckIn','CheckOut','Status'],
      ...reservasFiltradas.map(r=>[
        r._id, r.name, r.alojamientoId, r.checkIn, r.checkOut, r.status
      ])
    ];
    const csv = rows.map(row => row.map(val => '"'+String(val).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reservas.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Header onNav={onNav} />
      <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Panel Admin</h2>
  <nav className="mb-4 flex gap-4">
        <button className={tab==='reservas'?"font-bold text-blue-800":"text-blue-600"} onClick={()=>setTab('reservas')}>Reservas</button>
        <button className={tab==='alojamientos'?"font-bold text-blue-800":"text-blue-600"} onClick={()=>setTab('alojamientos')}>Alojamientos</button>
        <button className={tab==='bloqueos'?"font-bold text-blue-800":"text-blue-600"} onClick={()=>setTab('bloqueos')}>Bloqueos</button>
        <button className={tab==='usuarios'?"font-bold text-blue-800":"text-blue-600"} onClick={()=>setTab('usuarios')}>Usuarios</button>
      </nav>
      {tab==='reservas' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2 items-end">
            <select className="border px-2 py-1 rounded" value={filtros.estado} onChange={e=>setFiltros(f=>({...f,estado:e.target.value}))}>
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <select className="border px-2 py-1 rounded" value={filtros.alojamiento} onChange={e=>setFiltros(f=>({...f,alojamiento:e.target.value}))}>
              <option value="">Todos los alojamientos</option>
              {alojamientos.map(a=>(<option key={a._id} value={a._id}>{a.name}</option>))}
            </select>
            <input type="date" className="border px-2 py-1 rounded" value={filtros.desde} onChange={e=>setFiltros(f=>({...f,desde:e.target.value}))} />
            <input type="date" className="border px-2 py-1 rounded" value={filtros.hasta} onChange={e=>setFiltros(f=>({...f,hasta:e.target.value}))} />
            <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded" onClick={exportarCSV}>Exportar CSV</button>
          </div>
          {msg && <div className="mb-3 text-red-600">{msg}</div>}
          {loading ? <div>Cargando...</div> : (
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Nombre</th>
                  <th className="px-2 py-1">Alojamiento</th>
                  <th className="px-2 py-1">Fechas</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map(r => (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-1 text-xs break-all">{r._id}</td>
                    <td className="px-2 py-1">{r.name}</td>
                    <td className="px-2 py-1">{alojamientos.find(a=>a._id===r.alojamientoId)?.name || r.alojamientoId}</td>
                    <td className="px-2 py-1">{new Date(r.checkIn).toISOString().slice(0,10)} → {new Date(r.checkOut).toISOString().slice(0,10)}</td>
                    <td className="px-2 py-1">
                      <span className={
                        r.status==='confirmed' ? 'bg-green-100 text-green-800 px-2 py-1 rounded' :
                        r.status==='cancelled' ? 'bg-red-100 text-red-800 px-2 py-1 rounded' :
                        'bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
                      }>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      {r.status !== 'confirmed' && <button className="mr-2 px-2 py-1 bg-green-600 text-white rounded" onClick={() => patch(r._id, 'confirm')}>Confirmar</button>}
                      {r.status !== 'cancelled' && <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => patch(r._id, 'cancel')}>Cancelar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </>
      )}
      {tab==='alojamientos' && <AdminAlojamientos />}
      {tab==='bloqueos' && <AdminBloqueos alojamientos={alojamientos} />}
      {tab==='usuarios' && <AdminUsuarios />}
      </section>
    </div>
  );
}
