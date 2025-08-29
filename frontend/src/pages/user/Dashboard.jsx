import React from 'react';
import auth from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');

function usePerfil() {
  const [perfil, setPerfil] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const token = auth.getToken();
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setPerfil(d); setLoading(false); });
  }, []);
  return { perfil, setPerfil, loading };
}

function PerfilForm({ perfil, onUpdated }) {
  const [form, setForm] = React.useState({ name: perfil?.name||'', phone: perfil?.phone||'', preferredPaymentMethod: perfil?.preferredPaymentMethod||'manual' });
  const [saving, setSaving] = React.useState(false);
  React.useEffect(()=>{ setForm({ name: perfil?.name||'', phone: perfil?.phone||'', preferredPaymentMethod: perfil?.preferredPaymentMethod||'manual' }); }, [perfil]);
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const token = auth.getToken();
    await fetch(`${API_BASE}/profile/me`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(form) });
    onUpdated(); setSaving(false);
  };
  return (
    <form onSubmit={save} className="space-y-4 max-w-md">
      <input className="border w-full p-2 rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
      <input className="border w-full p-2 rounded" placeholder="Teléfono" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
      <select className="border w-full p-2 rounded" value={form.preferredPaymentMethod} onChange={e=>setForm(f=>({...f,preferredPaymentMethod:e.target.value}))}>
        <option value="manual">Manual</option>
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
      </select>
      <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
    </form>
  );
}

function MisReservas() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const token = auth.getToken();
  const load = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/profile/mis-reservas`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setList(d); setLoading(false); });
  };
  React.useEffect(load, []);
  const cancelar = async (id) => {
    const ok = confirm('¿Cancelar reserva?');
    if (!ok) return;
    await fetch(`${API_BASE}/profile/mis-reservas/${id}/cancel`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
    load();
  };
  const pagar = async (r) => {
    try {
      const token = auth.getToken();
      const stripeRes = await fetch(`${API_BASE}/payments/create-checkout-session`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ reservationId: r._id }) });
      const d = await stripeRes.json();
      if (stripeRes.ok && d.url) { window.location.href = d.url; return; }
      const ppRes = await fetch(`${API_BASE}/payments/paypal/create-order`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ reservationId: r._id }) });
      const d2 = await ppRes.json();
      if (ppRes.ok) {
        const approve = (d2.links||[]).find(l=>l.rel==='approve');
        if (approve) window.location.href = approve.href; else alert('Sin link PayPal');
      } else alert(d2.error||'Error iniciando pago');
    } catch(e){ alert('Error'); }
  };
  if (loading) return <div>Cargando...</div>;
  if (!list.length) return <div>No tienes reservas todavía.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr><th className="p-2">Fechas</th><th className="p-2">Estado</th><th className="p-2">Pago</th><th className="p-2">Total</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>
          {list.map(r=> (
            <tr key={r._id} className="border-t">
              <td className="p-2">{new Date(r.checkIn).toISOString().slice(0,10)} → {new Date(r.checkOut).toISOString().slice(0,10)}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.paymentStatus||'unpaid'}</td>
              <td className="p-2">${r.totalAmount}</td>
              <td className="p-2 flex gap-2">
                {['unpaid','failed'].includes(r.paymentStatus||'unpaid') && <button onClick={()=>pagar(r)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Pagar</button>}
                {r.status!=='cancelled' && <button onClick={()=>cancelar(r._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Cancelar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UserDashboard() {
  const { perfil, loading, setPerfil } = usePerfil();
  const [tab, setTab] = React.useState('perfil');
  if (!auth.isAuthenticated()) return <div className="max-w-lg mx-auto p-8"><p>Debes iniciar sesión.</p></div>;
  if (loading) return <div className="p-8">Cargando...</div>;
  return (
    <section className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Mi Cuenta</h2>
      <nav className="flex gap-4 mb-6">
        <button onClick={()=>setTab('perfil')} className={tab==='perfil'?'font-bold underline':''}>Perfil</button>
        <button onClick={()=>setTab('reservas')} className={tab==='reservas'?'font-bold underline':''}>Mis Reservas</button>
      </nav>
      {tab==='perfil' && <PerfilForm perfil={perfil} onUpdated={async ()=>{
        const token = auth.getToken();
        const r = await fetch(`${API_BASE}/profile/me`, { headers:{ Authorization:`Bearer ${token}` } });
        setPerfil(await r.json());
      }} />}
      {tab==='reservas' && <MisReservas />}
    </section>
  );
}
