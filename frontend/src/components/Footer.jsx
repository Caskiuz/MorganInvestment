import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-6 px-4 text-center mt-12">
      <div>© 2025 Reservas Montemorelos. Todos los derechos reservados.</div>
      <div className="mt-2 text-sm flex flex-col md:flex-row gap-2 justify-center items-center">
        <a className="text-green-400 hover:underline" href="mailto:jarorioz@gmail.com">jarorioz@gmail.com</a>
        <span className="hidden md:inline">·</span>
        <a className="text-green-400 hover:underline" href="tel:8261297349">826 129 7349</a>
      </div>
    </footer>
  );
}
