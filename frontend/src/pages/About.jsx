import React from 'react';

export default function About() {
  return (
    <section className="max-w-3xl mx-auto py-12 px-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6">Sobre Nosotros</h2>
      <p className="text-lg text-gray-700 mb-4">
        Somos un espacio de descanso en Montemorelos, rodeado de naturaleza, ideal para desconectarte y disfrutar con familia o amigos. Nuestras cabañas ofrecen comodidad y tranquilidad en un entorno único.
      </p>
      <img className="max-w-full rounded-xl mx-auto mt-4 shadow-lg" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Montemorelos naturaleza" />
    </section>
  );
}
