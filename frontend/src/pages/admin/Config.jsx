import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL + '/api');

export default function AdminConfig() {
  const [cfg, setCfg] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const r = await fetchAuth(`${API_BASE}/config`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Error');
      setCfg(d);
    } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setCfg(c => ({ ...c, [name]: value }));
  };

  const save = async () => {
    setLoading(true); setMsg(null);
    try {
      const r = await fetchAuth(`${API_BASE}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Error');
      setCfg(d); setMsg('Guardado');
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Configuración General</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Correo de contacto" name="contactoEmail" value={cfg.contactoEmail||''} onChange={handleChange} />
        <Field label="Teléfono" name="telefono" value={cfg.telefono||''} onChange={handleChange} />
        <Field label="Dirección" name="direccion" value={cfg.direccion||''} onChange={handleChange} />
        <Field label="Método de pago" name="metodoPago" value={cfg.metodoPago||''} onChange={handleChange} />
        <Field label="Nombre cuenta" name="pagoCuentaNombre" value={cfg.pagoCuentaNombre||''} onChange={handleChange} />
        <Field label="Número cuenta" name="pagoCuentaNumero" value={cfg.pagoCuentaNumero||''} onChange={handleChange} />
        <Field label="Banco" name="pagoBanco" value={cfg.pagoBanco||''} onChange={handleChange} />
        <Field label="CLABE" name="pagoClabe" value={cfg.pagoClabe||''} onChange={handleChange} />
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <TextArea label="Política de Cancelación" name="politicaCancelacion" value={cfg.politicaCancelacion||''} onChange={handleChange} />
        <TextArea label="Política Check-In" name="politicaCheckIn" value={cfg.politicaCheckIn||''} onChange={handleChange} />
        <TextArea label="Política Check-Out" name="politicaCheckOut" value={cfg.politicaCheckOut||''} onChange={handleChange} />
      </div>
      <div className="mt-6 flex gap-3 items-center">
        <button onClick={save} disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded shadow">{loading? 'Guardando...' : 'Guardar'}</button>
        {msg && <span className="text-sm text-blue-700">{msg}</span>}
      </div>
    </div>
  );
}

function Field({ label, ...rest }) {
  return (
    <label className="flex flex-col text-sm">
      <span className="font-medium mb-1">{label}</span>
      <input className="border rounded px-3 py-2" {...rest} />
    </label>
  );
}

function TextArea({ label, ...rest }) {
  return (
    <label className="flex flex-col text-sm">
      <span className="font-medium mb-1">{label}</span>
      <textarea rows={5} className="border rounded px-3 py-2" {...rest} />
    </label>
  );
}
