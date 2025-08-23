import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-4 px-4 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Logo y descripción */}
        <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
          <img src="/favicon.svg" alt="Montemorelos Logo" className="w-32 mb-2" />
          <p className="text-sm text-gray-300 max-w-xs">
            Especialistas en turismo de naturaleza y experiencias únicas en Montemorelos. Vive la aventura, relájate y conecta con la naturaleza en nuestras cabañas y actividades.
          </p>
        </div>
        {/* Navegación */}
        <div className="flex-1 mb-6 md:mb-0">
          <h3 className="font-bold mb-2 text-lg text-white">Navegación</h3>
          <ul className="space-y-1">
            <li><a href="#home" className="hover:underline text-gray-300">Inicio</a></li>
            <li><a href="#about" className="hover:underline text-gray-300">Sobre Nosotros</a></li>
            <li><a href="#galeria" className="hover:underline text-gray-300">Galería</a></li>
            <li><a href="#portafolio" className="hover:underline text-gray-300">Portafolio</a></li>
            <li><a href="#reservar" className="hover:underline text-gray-300">Reservar</a></li>
            <li><a href="#contacto" className="hover:underline text-gray-300">Contacto</a></li>
          </ul>
        </div>
        {/* Contacto */}
        <div className="flex-1">
          <h3 className="font-bold mb-2 text-lg text-white">Contacto</h3>
          <ul className="space-y-1 text-gray-300">
            <li><span className="inline-block w-5">📞</span> <a href="tel:8261297349" className="hover:underline">826 129 7349</a></li>
            <li><span className="inline-block w-5">✉️</span> <a href="mailto:jarorioz@gmail.com" className="hover:underline">jarorioz@gmail.com</a></li>
            <li><span className="inline-block w-5">📍</span> Montemorelos, Nuevo León</li>
            <li><span className="inline-block w-5">🕒</span> Lun-Dom: 8AM-8PM</li>
          </ul>
          <div className="mt-3">
            <span className="block mb-1">Síguenos en nuestras redes</span>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-2xl"> <i className="fab fa-facebook"></i> <span className="sr-only">Facebook</span></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-2xl"> <i className="fab fa-instagram"></i> <span className="sr-only">Instagram</span></a>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-400 border-t border-gray-800 mt-8 pt-4">
        © 2025 Reservas Montemorelos. Todos los derechos reservados.
      </div>
    </footer>
  );
}
