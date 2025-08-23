import React from 'react';

export default function Hero({ onReservar }) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-0 m-0 bg-black">
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
        alt="Montemorelos naturaleza cabañas"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 select-none"
        style={{ filter: 'brightness(0.6)' }}
        draggable="false"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 z-0" />
      <div className="relative z-10 text-center text-white flex flex-col items-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Vive la experiencia Montemorelos</h1>
        <p className="text-lg md:text-2xl mb-6">Reserva tu cabaña en la naturaleza y disfruta de un descanso único.</p>
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg shadow-xl transition-all duration-300 text-lg tracking-wide" onClick={() => { window.dispatchEvent(new Event('openReservar')); if (onReservar) onReservar(); }} style={{ boxShadow: '0 0 16px #22c55e99' }}>Reservar ahora</button>
      </div>
    </section>
  );
}
