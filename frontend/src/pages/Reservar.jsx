import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function Reservar() {
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState(null);
  const [alojamientos, setAlojamientos] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [total, setTotal] = React.useState(0);

  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [blockedDates, setBlockedDates] = React.useState([]);

  // Helpers para evitar problemas de timezone: trabajaremos con fechas locales
  const formatDateLocal = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseDateLocal = (strOrDate) => {
    if (!strOrDate) return undefined;
    if (typeof strOrDate === 'string') {
      // espera 'YYYY-MM-DD' o ISO; si viene YYYY-MM-DD, parsear en local
      const m = strOrDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      const d = new Date(strOrDate);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (strOrDate instanceof Date) return new Date(strOrDate.getFullYear(), strOrDate.getMonth(), strOrDate.getDate());
    return undefined;
  };

  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');

  React.useEffect(() => {
    const fetchA = async () => {
      try {
        const res = await fetch(`${API_BASE}/alojamientos`);
        const data = await res.json();
        setAlojamientos(data);
  if (data && data.length) { setSelected(data[0]._id); }
      } catch (e) { console.error(e); }
    };
    fetchA();
  }, []);

  // fetch blocked dates when selected alojamiento changes or after a reservation is created
  React.useEffect(() => {
    if (!selected) return;
    let mounted = true;
    const fetchBlocked = async () => {
      try {
        const res = await fetch(`${API_BASE}/reservas?alojamientoId=${selected}`);
        if (!res.ok) return;
        const data = await res.json();
        const dates = [];
        data.forEach(r => {
          const start = parseDateLocal(r.checkIn) || new Date(r.checkIn);
          const end = parseDateLocal(r.checkOut) || new Date(r.checkOut);
          const cursor = new Date(start);
          while (cursor < end) {
            dates.push(formatDateLocal(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        });
        if (mounted) setBlockedDates(Array.from(new Set(dates)));
      } catch (e) { console.error('fetchBlocked', e); }
    };
    fetchBlocked();
    return () => { mounted = false; };
  }, [selected]);

  const calcularTotal = (ci, co, alojamientoId) => {
    if (!ci || !co || !alojamientoId) return 0;
    const d1 = new Date(ci);
    const d2 = new Date(co);
    const nights = Math.max(0, Math.ceil((d2 - d1) / (1000*60*60*24)));
  const alojamiento = alojamientos.find(a => a._id === alojamientoId);
    return (alojamiento ? alojamiento.price : 0) * nights;
  };

  React.useEffect(() => {
    setTotal(calcularTotal(checkIn, checkOut, selected));
  }, [checkIn, checkOut, selected, alojamientos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const payload = {
      name: e.target.nombre.value,
      email: e.target.email.value || '',
      phone: e.target.telefono.value,
      alojamientoId: e.target.cabana.value,
      checkIn,
      checkOut,
      totalAmount: Number(total) || 0,
    };

    try {
      // comprobar disponibilidad
      const checkRes = await fetch(`${API_BASE}/reservas/check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alojamientoId: payload.alojamientoId, checkIn: payload.checkIn, checkOut: payload.checkOut })
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || 'Error comprobando disponibilidad');
      if (!checkData.available) {
        setMsg({ type: 'error', text: 'Las fechas seleccionadas no están disponibles' });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg({ type: 'success', text: 'Reserva creada correctamente. Te contactaremos pronto.' });
      // limpiar formulario
      e.target.reset();
      setCheckIn(''); setCheckOut('');
      // actualizar blocked dates
      const blocked = new Set(blockedDates);
      // add reserved days
  let cursor = parseDateLocal(payload.checkIn);
  const end = parseDateLocal(payload.checkOut);
  while (cursor < end) { blocked.add(formatDateLocal(cursor)); cursor.setDate(cursor.getDate()+1); }
      setBlockedDates(Array.from(blocked));
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al crear reserva' });
    } finally {
      setLoading(false);
    }
  };

  const onCalendarSelect = (range) => {
    // react-day-picker range selection provides { from, to }
    if (!range) { setCheckIn(''); setCheckOut(''); return; }
  const from = range.from ? formatDateLocal(parseDateLocal(range.from)) : '';
  const to = range.to ? formatDateLocal(parseDateLocal(range.to)) : '';
    // validar que el rango no intersecte fechas bloqueadas
    if (from && to) {
  const f = parseDateLocal(from);
  const t = parseDateLocal(to);
      let invalid = false;
      const blockedSet = new Set(blockedDates);
      const cursor = new Date(f);
      while (cursor <= t) {
        if (blockedSet.has(cursor.toISOString().slice(0,10))) { invalid = true; break; }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (invalid) {
        setMsg({ type: 'error', text: 'El rango seleccionado incluye fechas ya ocupadas. Elige otras fechas.' });
        return;
      }
    }
    setMsg(null);
  setCheckIn(from);
  setCheckOut(to);
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
          <select name="cabana" value={selected || ''} className="border rounded px-3 py-2" onChange={(e) => setSelected(e.target.value)}>
            {alojamientos.map(a => (<option key={a._id} value={a._id}>{a.name} — ${a.price}/noche</option>))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-left">
            <span className="mb-1 font-medium">Fecha de llegada</span>
            <input className="border rounded px-3 py-2" type="date" name="llegada" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </label>
          <label className="flex flex-col text-left">
            <span className="mb-1 font-medium">Fecha de salida</span>
            <input className="border rounded px-3 py-2" type="date" name="salida" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </label>
        </div>

        <div>
          <span className="mb-1 font-medium">Selecciona rango (fechas ocupadas en rojo)</span>
          <div className="mt-2">
            <DayPicker
              mode="range"
              fromMonth={new Date()}
              selected={{ from: checkIn ? parseDateLocal(checkIn) : undefined, to: checkOut ? parseDateLocal(checkOut) : undefined }}
              disabled={blockedDates.map(d => parseDateLocal(d))}
              onSelect={(sel) => onCalendarSelect(sel)}
              modifiersClassNames={{ disabled: 'bg-red-200 text-red-800' }}
            />
          </div>
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
