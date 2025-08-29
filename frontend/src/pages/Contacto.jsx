import React from 'react';
import { getPublicConfig } from '../services/api';

export default function Contacto() {
  const [cfg, setCfg] = React.useState({});
  React.useEffect(() => { getPublicConfig().then(setCfg); }, []);
  const tel = cfg.telefono || '826 000 0000';
  const email = cfg.contactoEmail || 'info@tudominio.com';
  const dir = cfg.direccion || 'Montemorelos, Nuevo León';
  return (
    <section className="max-w-xl mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">Contacto y Ubicación</h2>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2" data-aos="fade-up">
        <p className="font-medium">{dir}</p>
        <p><span className="font-medium">Tel:</span> <a className="text-green-600 hover:underline" href={`tel:${tel.replace(/\s+/g,'')}`}>{tel}</a></p>
        <p><span className="font-medium">Email:</span> <a className="text-green-600 hover:underline" href={`mailto:${email}`}>{email}</a></p>
        <iframe className="w-full h-56 mt-4 rounded shadow-inner" src="https://www.google.com/maps?q=Montemorelos,+Nuevo+Leon,+Mexico&output=embed" allowFullScreen loading="lazy" title="Ubicación"></iframe>
      </div>
    </section>
  );
}
