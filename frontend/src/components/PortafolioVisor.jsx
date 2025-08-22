import React, { useEffect, useState } from 'react';

// Visor simple inspirado en Xicalango pero usa la lista de archivos pasada por props (URLs)
export default function PortafolioVisor({ abierto, onClose, inicial = 0, archivos = [], esAdmin = false }) {
  const [indice, setIndice] = useState(inicial);
  const [tipo, setTipo] = useState('imagen'); // 'imagen' | 'video' (solo para UI)
  const [cargando, setCargando] = useState(true);
  const [startX, setStartX] = useState(null);
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);

  useEffect(() => {
    setIndice(inicial);
  }, [inicial, abierto]);

  useEffect(() => {
    setCargando(false);
  }, [indice, archivos]);

  // Ocultar pista de swipe después de unos segundos si no se interactúa
  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => setSwipeHintVisible(false), 2500);
    return () => clearTimeout(t);
  }, [abierto]);

  // Handlers táctiles para swipe
  const onTouchStart = (e) => {
    const touch = e.touches && e.touches[0];
    if (touch) setStartX(touch.clientX);
  };

  const onTouchMove = (e) => {
    // prevenir scroll horizontal accidental
  };

  const onTouchEnd = (e) => {
    if (startX == null) return;
    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const threshold = 50; // px
    if (dx > threshold) {
      prev();
      setSwipeHintVisible(false);
    } else if (dx < -threshold) {
      next();
      setSwipeHintVisible(false);
    }
    setStartX(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!abierto) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, indice, archivos]);

  if (!abierto) return null;

  const archivosFiltrados = archivos || [];
  const total = archivosFiltrados.length;
  const archivo = archivosFiltrados[indice] || null;

  const esVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const prev = () => setIndice(i => (total === 0 ? 0 : (i - 1 + total) % total));
  const next = () => setIndice(i => (total === 0 ? 0 : (i + 1) % total));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 sm:p-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        className="absolute top-4 right-4 sm:top-6 sm:right-8 text-white text-3xl font-bold hover:text-[#6FAD46]"
        onClick={onClose}
        aria-label="Cerrar visor"
      >
        ×
      </button>

      <button
        className="absolute left-2 sm:left-8 top-1/2 transform -translate-y-1/2 text-white text-3xl sm:text-4xl hover:text-[#6FAD46]"
        onClick={prev}
        aria-label="Anterior"
        disabled={total === 0}
      >
        ‹
      </button>

      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        {cargando ? (
          <p className="text-white text-center text-lg">Cargando...</p>
        ) : total === 0 ? (
          <p className="text-white text-center text-lg">No hay archivos para mostrar.</p>
        ) : esVideo(archivo) ? (
          <video
            src={archivo}
            controls
            autoPlay
            className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-2xl border-4 border-white bg-black"
          />
        ) : (
          <img
            src={archivo}
            alt={`Trabajo ${indice + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white"
          />
        )}

        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base bg-black bg-opacity-60 px-3 py-2 rounded-lg">
          {total > 0 ? `${indice + 1} / ${total}` : ''}
        </div>

        {/* Miniaturas inferiores para navegación rápida */}
        {total > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-2">
            {archivosFiltrados.map((a, i) => (
              <button
                key={i}
                onClick={() => { setIndice(i); setSwipeHintVisible(false); }}
                className={`w-12 h-8 rounded overflow-hidden border-2 ${i === indice ? 'border-white' : 'border-white/40'} focus:outline-none`}
                aria-label={`Ir a ${i + 1}`}
              >
                <img src={a} alt={`thumb-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Pista de swipe en móvil */}
        {swipeHintVisible && (
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white/10 text-white px-3 py-1 rounded-lg text-sm backdrop-blur">Desliza ◀ ▶</div>
        )}
      </div>

      <button
        className="absolute right-2 sm:right-8 top-1/2 transform -translate-y-1/2 text-white text-3xl sm:text-4xl hover:text-[#6FAD46]"
        onClick={next}
        aria-label="Siguiente"
        disabled={total === 0}
      >
        ›
      </button>
    </div>
  );
}
