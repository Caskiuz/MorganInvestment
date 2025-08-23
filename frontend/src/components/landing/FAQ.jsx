import React from "react";

const faqs = [
  { q: "¿Cómo hago una reserva?", a: "Selecciona fechas y cabaña en la sección de reservas y sigue los pasos." },
  { q: "¿Se admiten mascotas?", a: "Sí, algunas cabañas son pet-friendly. Consulta disponibilidad." },
  { q: "¿Qué actividades hay cerca?", a: "Senderismo, tours, gastronomía local y más." },
];

export default function FAQ() {
  const [open, setOpen] = React.useState(null);
  return (
    <section className="py-12 bg-green-50" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-green-800">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded shadow p-4">
              <button className="w-full text-left font-semibold text-green-700" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
              </button>
              {open === i && <div className="mt-2 text-gray-700">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
