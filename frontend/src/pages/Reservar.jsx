import React from 'react';

export default function Reservar() {
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState(null);
  const [alojamientos, setAlojamientos] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchA = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL + '/api'}/alojamientos`);
        const data = await res.json();
        setAlojamientos(data);
        if (data && data.length) { setSelected(data[0].id); }
      } catch (e) { console.error(e); }
    };
    fetchA();
  }, []);

  const calcularTotal = (checkIn, checkOut, alojamientoId) => {
    if (!checkIn || !checkOut || !alojamientoId) return 0;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(0, Math.ceil((co - ci) / (1000*60*60*24)));
    const alojamiento = alojamientos.find(a => a.id === alojamientoId);
    return (alojamiento ? alojamiento.price : 0) * nights;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const form = new FormData(e.target);
    const payload = {
      name: form.get('nombre'),
      email: form.get('email') || '',
      phone: form.get('telefono'),
      alojamientoId: form.get('cabana'),
      checkIn: form.get('llegada'),
      checkOut: form.get('salida'),
      totalAmount: Number(form.get('valor')) || 0,
    };

    try {
      // comprobar disponibilidad
      const checkRes = await fetch(`${import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL + '/api'}/reservas/check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alojamientoId: payload.alojamientoId, checkIn: payload.checkIn, checkOut: payload.checkOut })
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || 'Error comprobando disponibilidad');
      if (!checkData.available) {
        setMsg({ type: 'error', text: 'Las fechas seleccionadas no están disponibles' });
        setLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL + '/api'}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg({ type: 'success', text: 'Reserva creada correctamente. Te contactaremos pronto.' });
      e.target.reset();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al crear reserva' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">Formulario de Reservas</h2>
      <form className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Nombre</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" name="nombre" required />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Correo electrónico</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="email" name="email" />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Número de teléfono</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="tel" name="telefono" required pattern="[0-9]{10,15}" placeholder="Ej: 8112345678" />
        </label>

        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Cabaña a rentar</span>
          <select name="cabana" defaultValue={selected || ''} className="border rounded px-3 py-2" onChange={(e) => setSelected(e.target.value)}>
            {alojamientos.map(a => (<option key={a.id} value={a.id}>{a.name} — ${a.price}/noche</option>))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-left">
            <span className="mb-1 font-medium">Fecha de llegada</span>
            <input className="border rounded px-3 py-2" type="date" name="llegada" required onChange={(e) => setTotal(calcularTotal(e.target.value, document.querySelector('input[name="salida"]').value, selected))} />
          </label>
          <label className="flex flex-col text-left">
            <span className="mb-1 font-medium">Fecha de salida</span>
            <input className="border rounded px-3 py-2" type="date" name="salida" required onChange={(e) => setTotal(calcularTotal(document.querySelector('input[name="llegada"]').value, e.target.value, selected))} />
          </label>
        </div>

        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Total estimado (MXN)</span>
          <input value={total} className="border rounded px-3 py-2" type="number" name="valor" readOnly />
        </label>

        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow-lg transition mt-4" type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Reservar'}</button>
        {msg && (
          <div className={`${msg.type === 'success' ? 'text-green-700' : 'text-red-600'} mt-3 font-medium`}>{msg.text}</div>
        )}
      </form>
    </section>
  );
}
