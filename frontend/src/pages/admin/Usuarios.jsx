import React, { useState, useEffect } from 'react';

export default function AdminUsuarios() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ nombre: '', email: '', rol: '' });
  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

  const fetchList = async () => {
    if (ADMIN_SECRET) {
      const res = await fetch(`${API_BASE}/users`, { headers: { 'x-admin-secret': ADMIN_SECRET } });
      setList(await res.json());
    } else {
      const { fetchAuth } = await import('../../services/api');
      const res2 = await fetchAuth(`${API_BASE}/users`);
      setList(await res2.json());
    }
  };
  useEffect(() => { fetchList(); }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_BASE}/users/${editId}` : `${API_BASE}/users`;
    if (ADMIN_SECRET) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Error');
      else { setMsg('Guardado'); setForm({ name: '', email: '', password: '', role: 'user' }); setEditId(null); fetchList(); }
    } else {
      const { fetchAuth } = await import('../../services/api');
      const res2 = await fetchAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res2.json();
      if (!res2.ok) setMsg(data.error || 'Error');
      else { setMsg('Guardado'); setForm({ name: '', email: '', password: '', role: 'user' }); setEditId(null); fetchList(); }
    }
    setLoading(false);
  };

  const handleEdit = u => setForm({ ...u, password: '' }) || setEditId(u._id);
  const handleDelete = async id => { if (!window.confirm('¿Eliminar?')) return;
    if (ADMIN_SECRET) {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
      if (res.ok) fetchList();
    } else {
      const { fetchAuth } = await import('../../services/api');
      const res2 = await fetchAuth(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      if (res2.ok) fetchList();
    }
  };

  // Filtros y exportación CSV
  const filtrar = u => {
    if (filtros.nombre && !u.name.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
    if (filtros.email && !u.email.toLowerCase().includes(filtros.email.toLowerCase())) return false;
    if (filtros.rol && u.role !== filtros.rol) return false;
    return true;
  };
  const listFiltrada = list.filter(filtrar);
  function exportarCSV() {
    const rows = [
      ['ID','Nombre','Email','Rol'],
      ...listFiltrada.map(u=>[
        u._id, u.name, u.email, u.role
      ])
    ];
    const csv = rows.map(row => row.map(val => '"'+String(val).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'usuarios.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input className="border px-2 py-1 rounded" placeholder="Buscar por nombre" value={filtros.nombre} onChange={e=>setFiltros(f=>({...f,nombre:e.target.value}))} />
        <input className="border px-2 py-1 rounded" placeholder="Buscar por email" value={filtros.email} onChange={e=>setFiltros(f=>({...f,email:e.target.value}))} />
        <select className="border px-2 py-1 rounded" value={filtros.rol} onChange={e=>setFiltros(f=>({...f,rol:e.target.value}))}>
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
        <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded" onClick={exportarCSV} type="button">Exportar CSV</button>
      </div>
      {msg && <div className="mb-2 text-red-600">{msg}</div>}
      <form className="mb-6 flex flex-col gap-2" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="border px-2 py-1 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="border px-2 py-1 rounded" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" type="password" className="border px-2 py-1 rounded" required={!editId} />
        <select name="role" value={form.role} onChange={handleChange} className="border px-2 py-1 rounded">
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" className="text-sm text-blue-600" onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', role: 'user' }); }}>Cancelar edición</button>}
      </form>
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">Nombre</th>
            <th className="px-2 py-1">Email</th>
            <th className="px-2 py-1">Rol</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listFiltrada.map(u => (
            <tr key={u._id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1">{u.name}</td>
              <td className="px-2 py-1">{u.email}</td>
              <td className="px-2 py-1">
                {u.role === 'admin' ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span> : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Usuario</span>}
              </td>
              <td className="px-2 py-1">
                <button className="text-blue-600 mr-2" onClick={() => handleEdit(u)}>Editar</button>
                <button className="text-red-600" onClick={() => handleDelete(u._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
