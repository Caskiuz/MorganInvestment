import React from 'react';

export default function Contacto() {
  return (
    <section className="max-w-xl mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">Contacto y Ubicación</h2>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2">
        <p className="font-medium">Antiguo Camino a Rayones Ejido Puerta de la Boca, Montemorelos, México</p>
        <p><span className="font-medium">Tel:</span> <a className="text-green-600 hover:underline" href="tel:8261297349">826 129 7349</a></p>
        <p><span className="font-medium">Email:</span> <a className="text-green-600 hover:underline" href="mailto:jarorioz@gmail.com">jarorioz@gmail.com</a></p>
        <iframe className="w-full h-56 mt-4 rounded" src="https://www.google.com/maps?q=Antiguo+Camino+a+Rayones+Ejido+Puerta+de+la+Boca,+Montemorelos,+Mexico&output=embed" allowFullScreen="" loading="lazy" title="Ubicación"></iframe>
      </div>
    </section>
  );
}
