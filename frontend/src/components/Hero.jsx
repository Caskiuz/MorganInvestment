import React from 'react';

export default function Hero({ onReservar }) {
  return (
    <section className="relative flex items-center justify-center h-[60vh] md:h-[80vh] w-full overflow-hidden mt-16">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')", filter: 'brightness(0.7)'}} />
      <div className="relative z-10 text-center text-white flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Vive la experiencia Montemorelos</h1>
        <p className="text-lg md:text-2xl mb-6">Reserva tu cabaña en la naturaleza y disfruta de un descanso único.</p>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow-lg transition" onClick={onReservar}>Reservar ahora</button>
      </div>
    </section>
  );
}
