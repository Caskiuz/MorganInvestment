import React from "react";
import { getActividades } from '../../services/api';

export default function Actividades() {
  const [actividades, setActividades] = React.useState([]);
  React.useEffect(() => {
    getActividades().then(setActividades);
  }, []);
  return (
    <section className="py-12 bg-white" id="actividades">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-green-800">Actividades y Experiencias</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {actividades.map((a, i) => (
            <div key={i} className="bg-green-50 rounded-lg shadow p-6 flex flex-col items-center" data-aos="zoom-in">
              <span className="text-4xl mb-2">{a.icon}</span>
              <h3 className="text-xl font-semibold mb-1 text-green-700">{a.titulo}</h3>
              <p className="text-gray-700 text-center">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
