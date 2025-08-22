import React from 'react';
import Lightbox from '../components/Lightbox';

// Cargar todas las imágenes desde /src/IMG usando Vite (eager)
const modules = import.meta.glob('/src/IMG/*.{jpg,jpeg,png,svg,webp}', { eager: true });
const images = Object.values(modules).map(m => (m && m.default) ? m.default : m);

export default function Galeria() {
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState(0);

  return (
    <section className="max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">Galería de Cabañas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <button key={i} onClick={() => { setStart(i); setOpen(true); }} className="rounded-lg overflow-hidden shadow-md w-full h-56">
            <img src={img} alt={`Cabaña ${i+1}`} className="w-full h-56 object-cover" />
          </button>
        ))}
      </div>

      <Lightbox images={images} startIndex={start} isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
