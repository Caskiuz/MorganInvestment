import React, { useState } from 'react';
import auth from '../utils/auth';
import Modal from './Modal';
import AuthForm from './AuthForm';
import AuthStatus from './AuthStatus';
import Reservar from '../pages/Reservar';

export default function Header({ onNav }) {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuth, setIsAuth] = useState(auth.isAuthenticated());
  const [showReservar, setShowReservar] = useState(false);
  React.useEffect(() => {
    const handler = () => setIsAuth(auth.isAuthenticated());
    window.addEventListener('authChanged', handler);
    return () => window.removeEventListener('authChanged', handler);
  }, []);

  // Escuchar evento global para abrir el modal de reservar desde otros componentes
  React.useEffect(() => {
    const abrir = () => setShowReservar(true);
    window.addEventListener('openReservar', abrir);
    return () => window.removeEventListener('openReservar', abrir);
  }, []);

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
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-green-100 animate-fadeInDown">
      <div className="text-2xl font-bold text-green-700 tracking-wide drop-shadow-lg select-none">Montemorelos</div>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-2 lg:gap-4">
          {[
            { label: 'Inicio', section: 'home' },
            { label: 'Sobre Nosotros', section: 'about' },
            { label: 'Galería', section: 'galeria' },
            { label: 'Contacto', section: 'contacto' },
          ].map(({ label, section }) => (
            <button
              key={section}
              className="bg-transparent text-gray-700 hover:text-green-600 font-medium px-3 py-2 transition-all duration-200 relative group"
              onClick={() => onNav(section)}
            >
              <span className="relative z-10">{label}</span>
              <span className="absolute left-0 bottom-0 w-0 h-1 bg-green-400 rounded-full group-hover:w-full transition-all duration-300" style={{transitionProperty:'width'}}></span>
            </button>
          ))}
          {isAuth && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ml-2 animate-glow"
              onClick={() => setShowReservar(true)}
              style={{ boxShadow: '0 0 12px #22c55e99' }}
            >
              Reservar
            </button>
          )}
          {isAuth ? (
            <button
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 ml-2 font-semibold shadow-md transition-all duration-300 animate-glow"
              onClick={() => { auth.clear(); }}
              style={{ boxShadow: '0 0 12px #ff000099' }}
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              className="bg-green-400 hover:bg-green-500 text-white rounded-lg px-4 py-2 ml-2 font-semibold shadow-md transition-all duration-300 animate-glow"
              onClick={() => setShowAuth(true)}
              style={{ boxShadow: '0 0 12px #22ff2299' }}
            >
              Iniciar sesión
            </button>
          )}
          <a className="ml-6 text-gray-700 hover:text-green-700" href="/admin.html" target="_blank" rel="noreferrer">Admin</a>
        </nav>
        <div className="hidden md:block ml-4"><AuthStatus /></div>
      </div>
      {/* Botón 'Reservar ahora' eliminado para diseño one-page y responsive */}

      {/* Botón menú móvil (preservado) */}
      <div className="md:hidden">
        <MobileMenu
          onNav={onNav}
          onReservar={() => setShowReservar(true)}
          isAuth={isAuth}
          onAuth={() => setShowAuth(true)}
          onLogout={() => auth.clear()}
        />
      </div>
      <Modal isOpen={showAuth} onClose={() => setShowAuth(false)}>
        <AuthForm onClose={() => setShowAuth(false)} />
      </Modal>
      <Modal isOpen={showReservar} onClose={() => setShowReservar(false)}>
        <Reservar />
      </Modal>
    </header>
  );
}

// Menú móvil profesional

export function MobileMenu({ onNav, onReservar, isAuth, onAuth, onLogout }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        className="p-2 bg-green-600 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col items-end animate-fadeIn">
          <div className="w-64 bg-white rounded-l-2xl shadow-2xl h-full flex flex-col p-6 gap-4 animate-slideInRight">
            <button className="self-end text-3xl text-gray-400 hover:text-red-500 mb-2" onClick={() => setOpen(false)} aria-label="Cerrar menú">&times;</button>
            {[
              { label: 'Inicio', section: 'home' },
              { label: 'Sobre Nosotros', section: 'about' },
              { label: 'Galería', section: 'galeria' },
              { label: 'Contacto', section: 'contacto' },
            ].map(({ label, section }) => (
              <button
                key={section}
                className="text-left text-lg font-medium text-gray-700 hover:text-green-600 py-2 px-2 rounded transition-all"
                onClick={() => { onNav(section); setOpen(false); }}
              >
                {label}
              </button>
            ))}
            {isAuth && (
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 mt-2 animate-glow"
                onClick={() => { onReservar(); setOpen(false); }}
                style={{ boxShadow: '0 0 12px #22c55e99' }}
              >
                Reservar
              </button>
            )}
            {isAuth ? (
              <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 font-semibold shadow-md transition-all duration-300 animate-glow mt-2"
                onClick={() => { onLogout(); setOpen(false); }}
                style={{ boxShadow: '0 0 12px #ff000099' }}
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                className="bg-green-400 hover:bg-green-500 text-white rounded-lg px-4 py-2 font-semibold shadow-md transition-all duration-300 animate-glow mt-2"
                onClick={() => { onAuth(); setOpen(false); }}
                style={{ boxShadow: '0 0 12px #22ff2299' }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
