import React from 'react';
import PortafolioVisor from '../../PortafolioVisor';

// Cargar imágenes locales desde /src/IMG (Vite - eager)
const modules = import.meta.glob('/src/IMG/*.{jpg,jpeg,png,webp,svg}', { eager: true });
const allImages = Object.values(modules).map(m => m.default);

export default function PortfolioSection() {
  const [miniaturas, setMiniaturas] = React.useState([]);
  const [imagenes, setImagenes] = React.useState(allImages);
  const [visorAbierto, setVisorAbierto] = React.useState(false);
  const [indiceVisor, setIndiceVisor] = React.useState(0);

  // UX extras
  const [toastVisible, setToastVisible] = React.useState(false);
  const [revealed, setRevealed] = React.useState([]); // índices revelados
  const thumbRefs = React.useRef([]);

  React.useEffect(() => {
    // seleccionar hasta 4 miniaturas aleatorias (o menos si no hay suficientes)
    const shuffled = [...imagenes].sort(() => 0.5 - Math.random());
    setMiniaturas(shuffled.slice(0, 4));

    // mostrar toast breve cuando la galería cargue
    if (imagenes.length > 0) {
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 1800);
      return () => clearTimeout(t);
    }
  }, [imagenes]);

  // Observador para animar entradas de miniaturas
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset_idx);
          setRevealed(prev => (prev.includes(idx) ? prev : [...prev, idx]));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    thumbRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [miniaturas]);

  // Sonido simple con Web Audio API
  const playSound = (type = 'open') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);

      if (type === 'open') {
        o.frequency.value = 880; // tono
        g.gain.value = 0.0001;
        o.start();
        g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        setTimeout(() => o.stop(), 360);
      }
    } catch (e) {
      // silenciar fallos
      // console.log('Audio no disponible', e);
    }
  };

  const abrirVisor = (idx) => {
    // idx corresponde a la posición en miniaturas; obtener índice real en allImages
    const realIndex = imagenes.indexOf(miniaturas[idx]);
    setIndiceVisor(realIndex >= 0 ? realIndex : 0);
    setVisorAbierto(true);
    playSound('open');
  };

  return (
    <section id="portafolio" className="w-full py-10 sm:py-16 bg-[#f6fff2] flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-4 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#6FAD46] mb-6 sm:mb-8 text-center">Portafolio</h2>

        {/* grid de miniaturas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {miniaturas.map((img, idx) => (
            <div
              key={idx}
              ref={el => (thumbRefs.current[idx] = el)}
              data_idx={idx}
              className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group h-56 sm:h-64 transform transition-all duration-500 ${revealed.includes(idx) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}
              onClick={() => abrirVisor(idx)}
            >
              <img src={img} alt={`mini-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                <span className="text-white text-base sm:text-lg font-semibold">Ver galería completa</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast simple */}
      {toastVisible && (
        <div className="fixed bottom-28 right-6 z-50">
          <div className="bg-white/95 text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-100">Galería cargada</div>
        </div>
      )}

      <PortafolioVisor abierto={visorAbierto} onClose={() => setVisorAbierto(false)} inicial={indiceVisor} archivos={imagenes} />

      {/* Estilos locales para la animación inicial (fallback si Tailwind no tiene keyframes personalizados) */}
      <style>{`
        /* suaviza la transición inicial de miniaturas */
        .transform { will-change: transform, opacity; }
      `}</style>
    </section>
  );
}
