import React, { useState, useEffect } from 'react';

export default function AdminBloqueos({ alojamientos }) {
  const [selected, setSelected] = useState('');
  const [bloqueos, setBloqueos] = useState([]);
  const [form, setForm] = useState({ start: '', end: '', motivo: '' });
  const [msg, setMsg] = useState(null);
  const [filtros, setFiltros] = useState({ desde: '', hasta: '', motivo: '' });
  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

  useEffect(() => {
    if (selected) fetchBloqueos(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const fetchBloqueos = async (alojamientoId) => {
    try {
      const res = await fetch(`${API_BASE}/bloqueos/${alojamientoId}`);
      if (res.ok) setBloqueos(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected || !form.start || !form.end) return setMsg('Completa todos los campos');
    try {
      const body = JSON.stringify({ alojamiento: selected, ...form });
      if (ADMIN_SECRET) {
        const res = await fetch(`${API_BASE}/bloqueos`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }, body });
        if (res.ok) { setMsg('Bloqueo creado'); setForm({ start: '', end: '', motivo: '' }); fetchBloqueos(selected); }
        else setMsg('Error');
      } else {
        const { fetchAuth } = await import('../../services/api');
        const res2 = await fetchAuth(`${API_BASE}/bloqueos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (res2.ok) { setMsg('Bloqueo creado'); setForm({ start: '', end: '', motivo: '' }); fetchBloqueos(selected); }
        else setMsg('Error');
      }
    } catch (e) { console.error(e); setMsg('Error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar bloqueo?')) return;
    try {
      if (ADMIN_SECRET) {
        const res = await fetch(`${API_BASE}/bloqueos/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
        if (res.ok) fetchBloqueos(selected);
      } else {
        const { fetchAuth } = await import('../../services/api');
        const res2 = await fetchAuth(`${API_BASE}/bloqueos/${id}`, { method: 'DELETE' });
        if (res2.ok) fetchBloqueos(selected);
      }
    } catch (e) { console.error(e); }
  };

  const filtered = bloqueos.filter(b => {
    if (filtros.desde && new Date(b.start) < new Date(filtros.desde)) return false;
    if (filtros.hasta && new Date(b.end) > new Date(filtros.hasta)) return false;
    if (filtros.motivo && (!b.motivo || !b.motivo.toLowerCase().includes(filtros.motivo.toLowerCase()))) return false;
    return true;
  });

  const exportarCSV = () => {
    const rows = [
      ['ID','Inicio','Fin','Motivo'],
      ...filtered.map(b => [b._id, b.start, b.end, b.motivo])
    ];
    const csv = rows.map(row => row.map(val => '"'+String(val).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bloqueos.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Bloqueos de Disponibilidad</h2>
      <select className="border px-2 py-1 rounded mb-4" value={selected} onChange={e=>setSelected(e.target.value)}>
        <option value="">Selecciona alojamiento</option>
        {alojamientos.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
      </select>
      {selected && <>
        <form className="mb-4 flex gap-2 flex-wrap items-end" onSubmit={handleSubmit}>
          <input type="date" name="start" value={form.start} onChange={handleChange} className="border px-2 py-1 rounded" required />
          <input type="date" name="end" value={form.end} onChange={handleChange} className="border px-2 py-1 rounded" required />
          <input name="motivo" value={form.motivo} onChange={handleChange} placeholder="Motivo (opcional)" className="border px-2 py-1 rounded" />
          <button className="bg-green-600 text-white px-4 py-2 rounded">Bloquear</button>
        </form>
        <div className="mb-4 flex flex-wrap gap-2 items-end">
          <input type="date" className="border px-2 py-1 rounded" value={filtros.desde} onChange={e=>setFiltros(f=>({...f,desde:e.target.value}))} placeholder="Desde" />
          <input type="date" className="border px-2 py-1 rounded" value={filtros.hasta} onChange={e=>setFiltros(f=>({...f,hasta:e.target.value}))} placeholder="Hasta" />
          <input className="border px-2 py-1 rounded" placeholder="Buscar motivo" value={filtros.motivo} onChange={e=>setFiltros(f=>({...f,motivo:e.target.value}))} />
          <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded" type="button" onClick={exportarCSV}>Exportar CSV</button>
        </div>
        {msg && <div className="mb-2 text-red-600">{msg}</div>}
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1">Inicio</th>
              <th className="px-2 py-1">Fin</th>
              <th className="px-2 py-1">Motivo</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1">{b.start && b.start.slice(0,10)}</td>
                <td className="px-2 py-1">{b.end && b.end.slice(0,10)}</td>
                <td className="px-2 py-1">{b.motivo ? <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{b.motivo}</span> : ''}</td>
                <td className="px-2 py-1"><button className="text-red-600" onClick={()=>handleDelete(b._id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </>}
    </section>
  );
}
