import React, { useState } from 'react';
import { postTestimonio } from '../../services/api';

export default function TestimonioForm({ onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    setOk(false);
    setError("");
    const res = await postTestimonio({ nombre, texto });
    if (res.ok) {
      setOk(true);
      setNombre("");
      setTexto("");
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Error al enviar testimonio");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md mx-auto mt-8">
      <h3 className="text-xl font-bold mb-4 text-green-800">Deja tu testimonio</h3>
      <input type="text" required placeholder="Tu nombre" className="p-2 rounded border w-full mb-2" value={nombre} onChange={e => setNombre(e.target.value)} />
      <textarea required placeholder="Tu experiencia..." className="p-2 rounded border w-full mb-2" value={texto} onChange={e => setTexto(e.target.value)} rows={3} />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">Enviar</button>
      {ok && <div className="text-green-700 mt-2">¡Gracias por tu testimonio!</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}
