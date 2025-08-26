import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

export default function AdminAlojamientos() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', capacity: '', extras: [], newExtra: '', images: [] });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ nombre: '', activo: '' });

  const fetchList = async () => {
    const res = await fetch(`${API_BASE}/alojamientos`);
    setList(await res.json());
  };
  useEffect(() => { fetchList(); }, []);


  const handleFile = (e) => setForm(f => ({ ...f, images: e.target.files }));
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'price' && value && Number(value) < 0) return;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleAddExtra = e => {
    e.preventDefault();
    if (form.newExtra && !form.extras.includes(form.newExtra)) {
      setForm(f => ({ ...f, extras: [...f.extras, f.newExtra], newExtra: '' }));
    }
  };
  const handleRemoveExtra = extra => {
    setForm(f => ({ ...f, extras: f.extras.filter(e => e !== extra) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'images') Array.from(v).forEach(img => fd.append('images', img));
      else if (k === 'extras') fd.append('extras', JSON.stringify(v));
      else if (k !== 'newExtra') fd.append(k, v);
    });
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_BASE}/alojamientos/${editId}` : `${API_BASE}/alojamientos`;
    const res = await fetch(url, { method, headers: { 'x-admin-secret': ADMIN_SECRET }, body: fd });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || 'Error');
  else { setMsg('Guardado'); setForm({ name: '', description: '', price: '', capacity: '', extras: [], newExtra: '', images: [] }); setEditId(null); fetchList(); }
    setLoading(false);
  };

  const handleEdit = a => setForm({ ...a, images: [], extras: Array.isArray(a.extras) ? a.extras : (typeof a.extras === 'string' ? a.extras.split(',').map(e=>e.trim()).filter(Boolean) : []) , newExtra: '' }) || setEditId(a._id);
  const handleDelete = async id => { if (!window.confirm('¿Eliminar?')) return;
    const res = await fetch(`${API_BASE}/alojamientos/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
    if (res.ok) fetchList();
  };

  // Filtros y exportación CSV
  const filtrar = a => {
    if (filtros.nombre && !a.name.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
    if (filtros.activo && String(a.active) !== filtros.activo) return false;
    return true;
  };
  const listFiltrada = list.filter(filtrar);
  function exportarCSV() {
    const rows = [
      ['ID','Nombre','Precio','Capacidad','Extras','Activo'],
      ...listFiltrada.map(a=>[
        a._id, a.name, a.price, a.capacity, (Array.isArray(a.extras)?a.extras.join(';'):a.extras), a.active
      ])
    ];
    const csv = rows.map(row => row.map(val => '"'+String(val).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'alojamientos.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Cabañas / Alojamientos</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input className="border px-2 py-1 rounded" placeholder="Buscar por nombre" value={filtros.nombre} onChange={e=>setFiltros(f=>({...f,nombre:e.target.value}))} />
        <select className="border px-2 py-1 rounded" value={filtros.activo} onChange={e=>setFiltros(f=>({...f,activo:e.target.value}))}>
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded" onClick={exportarCSV} type="button">Exportar CSV</button>
      </div>
      {msg && <div className="mb-2 text-red-600">{msg}</div>}
      <form className="mb-6 flex flex-col gap-2" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="border px-2 py-1 rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border px-2 py-1 rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Precio por noche" type="number" min="0" className="border px-2 py-1 rounded" required />
        <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacidad" type="number" min="1" className="border px-2 py-1 rounded" />
        <div>
          <div className="flex gap-2 mb-1">
            <input name="newExtra" value={form.newExtra} onChange={handleChange} placeholder="Agregar extra" className="border px-2 py-1 rounded flex-1" />
            <button onClick={handleAddExtra} className="bg-blue-500 text-white px-2 py-1 rounded">Añadir</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.extras.map(extra => (
              <span key={extra} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                {extra} <button type="button" className="ml-1 text-red-600" onClick={()=>handleRemoveExtra(extra)}>×</button>
              </span>
            ))}
          </div>
        </div>
        <input name="images" type="file" multiple accept="image/*" onChange={handleFile} className="border px-2 py-1 rounded" />
        <button className="bg-green-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" className="text-sm text-blue-600" onClick={() => { setEditId(null); setForm({ name: '', description: '', price: '', capacity: '', extras: [], newExtra: '', images: [] }); }}>Cancelar edición</button>}
      </form>
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">Nombre</th>
            <th className="px-2 py-1">Precio</th>
            <th className="px-2 py-1">Capacidad</th>
            <th className="px-2 py-1">Extras</th>
            <th className="px-2 py-1">Activo</th>
            <th className="px-2 py-1">Imágenes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listFiltrada.map(a => (
            <tr key={a._id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1">{a.name}</td>
              <td className="px-2 py-1">${a.price}</td>
              <td className="px-2 py-1">{a.capacity}</td>
              <td className="px-2 py-1">
                {(Array.isArray(a.extras) ? a.extras : (typeof a.extras === 'string' ? a.extras.split(',').map(e=>e.trim()).filter(Boolean) : [])).map(extra => (
                  <span key={extra} className="bg-gray-100 px-2 py-1 rounded mr-1 text-xs">{extra}</span>
                ))}
              </td>
              <td className="px-2 py-1">
                {a.active === false ? <span className="bg-red-100 text-red-800 px-2 py-1 rounded">No</span> : <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Sí</span>}
              </td>
              <td className="px-2 py-1">{(a.images||[]).map(img => <img key={img} src={img} alt="img" className="inline w-12 h-12 object-cover mr-1" />)}</td>
              <td className="px-2 py-1">
                <button className="text-blue-600 mr-2" onClick={() => handleEdit(a)}>Editar</button>
                <button className="text-red-600" onClick={() => handleDelete(a._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
