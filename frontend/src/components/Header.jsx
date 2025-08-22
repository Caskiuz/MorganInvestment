import React from 'react';

export default function Header({ onNav }) {
  // Función para navegar a secciones internas del Home y hacer scroll suave
  const navigateToSection = (sectionId) => {
    // Primero aseguramos que la app muestre la página 'home'
    onNav('home');

    const realId = sectionId;
    const tryScroll = () => {
      const el = document.getElementById(realId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return true;
      }
      return false;
    };

    let tries = 0;
    const maxTries = 30;
    const interval = setInterval(() => {
      tries += 1;
      if (tryScroll() || tries >= maxTries) {
        clearInterval(interval);
      }
    }, 120);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md fixed w-full top-0 z-50">
      <div className="text-2xl font-bold text-green-700 tracking-wide">Montemorelos</div>
      <nav className="hidden md:flex gap-2 lg:gap-4">
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => onNav('home')}>Inicio</button>
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => onNav('about')}>Sobre Nosotros</button>
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => onNav('galeria')}>Galería</button>
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => navigateToSection('portafolio')}>Portafolio</button>
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => onNav('reservar')}>Reservar</button>
        <button className="bg-transparent text-gray-700 hover:text-green-700 font-medium px-3 py-2 transition active:scale-95" onClick={() => onNav('contacto')}>Contacto</button>
      </nav>
      <button className="bg-green-600 text-white rounded px-4 py-2 ml-4 font-semibold shadow hover:bg-green-700 transition hidden md:block active:scale-95" onClick={() => onNav('reservar')}>Reservar ahora</button>

      {/* Botón menú móvil (preservado) */}
      <div className="md:hidden">
        {/* dejamos el menú móvil original pero simple: abre la página Home y muestra secciones */}
        <button
          className="p-2 bg-green-600 text-white rounded-full shadow"
          onClick={() => {
            // en mobile, llevar a Home y mostrar sección Portafolio como ancla
            navigateToSection('portafolio');
          }}
          aria-label="Ir al portafolio"
        >
          📸
        </button>
      </div>
    </header>
  );
}
