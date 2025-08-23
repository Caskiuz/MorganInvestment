import React from "react";
import { getOfertas } from '../../services/api';

export default function Ofertas() {
  const [ofertas, setOfertas] = React.useState([]);
  React.useEffect(() => {
    getOfertas().then(setOfertas);
  }, []);
  return (
    <section className="py-12 bg-green-50" id="ofertas">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-green-800">Ofertas y Promociones</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {ofertas.map((oferta, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 relative" data-aos="zoom-in">
              {oferta.badge && <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">{oferta.badge}</span>}
              <h3 className="text-xl font-semibold mb-2 text-green-700">{oferta.titulo}</h3>
              <p className="text-gray-700">{oferta.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
