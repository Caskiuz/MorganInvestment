import React, { useState } from "react";
import { postNewsletter } from '../../services/api';

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    setOk(false);
    setError("");
    const res = await postNewsletter(email);
    if (res.ok) {
      setOk(true);
      setEmail("");
    } else {
      setError(res.error || "Error al suscribir");
    }
  };
  return (
    <section className="py-12 bg-green-50" id="newsletter">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-800">Recibe ofertas y novedades</h2>
        <p className="mb-4 text-gray-700">Suscríbete a nuestro boletín para enterarte de promociones y noticias.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <input type="email" required placeholder="Tu correo electrónico" className="p-2 rounded border w-full sm:w-auto" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">Suscribirme</button>
        </form>
        {ok && <div className="text-green-700 mt-2">¡Gracias por suscribirte!</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </section>
  );
}
