import React from 'react';

export default function Lightbox({ images = [], startIndex = 0, isOpen, onClose }) {
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  React.useEffect(() => {
    function onKey(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;
  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-w-6xl w-full">
        <button
          className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <img
          src={images[index]}
          alt={`imagen-${index}`}
          className="w-full h-[70vh] object-contain rounded-lg bg-gray-900"
        />

        {/* Prev */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-3 hover:bg-black/60"
          onClick={() => setIndex(i => Math.max(i - 1, 0))}
          disabled={index === 0}
          aria-label="Anterior"
        >
          ‹
        </button>

        {/* Next */}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-3 hover:bg-black/60"
          onClick={() => setIndex(i => Math.min(i + 1, images.length - 1))}
          disabled={index === images.length - 1}
          aria-label="Siguiente"
        >
          ›
        </button>

        {/* thumbnails */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`rounded-lg overflow-hidden border ${i === index ? 'ring-4 ring-green-400' : 'ring-0'}`}>
              <img src={src} alt={`thumb-${i}`} className="h-20 w-32 object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
