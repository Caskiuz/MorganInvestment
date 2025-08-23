import React from "react";
import { getTestimonios } from '../../services/api';

export default function Testimonios() {
  const [testimonios, setTestimonios] = React.useState([]);
  React.useEffect(() => {
    getTestimonios().then(setTestimonios);
  }, []);
  return (
    <section className="py-12 bg-white" id="testimonios">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-green-800">Testimonios</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <div key={i} className="bg-green-50 rounded-lg shadow p-6" data-aos="fade-up">
              <p className="italic text-gray-700 mb-2">"{t.texto}"</p>
              <div className="text-green-700 font-semibold">- {t.nombre}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
