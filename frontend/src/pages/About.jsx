import React from 'react';

export default function About() {
  return (
    <section className="w-full bg-gray-50 py-0">
      {/* Contenedor principal sin espacios grandes entre secciones */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
          {/* Mitad izquierda: inicio (titulo, subtitulo y primeros párrafos) */}
          <div className="text-gray-700 text-lg md:text-xl space-y-6">
            <p>
              <span className="font-semibold text-green-700">Desde hace décadas</span>, nuestras cabañas han sido el refugio ideal para quienes buscan desconectarse y vivir experiencias auténticas en la naturaleza. Cada construcción conserva el carácter tradicional de la región, combinando materiales locales y diseño pensado para integrarse al paisaje. Nuestros huéspedes valoran la tranquilidad, la atención personalizada y los detalles que hacen única cada estancia, desde ropa de cama de calidad hasta espacios al aire libre para disfrutar el amanecer.
            </p>

            <p>
              Nuestra historia comenzó con una pequeña cabaña familiar y el sueño de compartir la belleza de este lugar con el mundo. Con el tiempo expandimos la oferta sin perder la calidez original: hoy contamos con opciones que van desde cabañas acogedoras para parejas hasta casas más amplias para familias y grupos. Además, trabajamos con productores locales para ofrecer desayunos y experiencias gastronómicas basadas en productos de la zona, promoviendo la economía local y ofreciendo al visitante sabores auténticos.
            </p>
          </div>

          {/* Mitad derecha: fin (párrafos finales) anclada a la derecha en pantallas grandes */}
          <div className="flex justify-end">
            <div className="text-gray-700 text-lg md:text-xl space-y-6 max-w-md">
              <p>
                <span className="font-bold text-green-700">¿Qué hacer en Montemorelos?</span> Disfruta de caminatas por el bosque, paseos en bicicleta, observación de aves, pesca, fogatas nocturnas y recorridos a cascadas cercanas. También organizamos actividades guiadas: rutas por senderos interpretativos, talleres de fotografía de naturaleza, visitas a viñedos y recorridos culturales por localidades cercanas. Para los amantes de la aventura ofrecemos circuitos de rappel y kayak en temporadas con caudal adecuado, y para quienes buscan calma, rincones para la lectura y meditación al borde del río.
              </p>

              <p>
                Ven a Montemorelos y vive una experiencia única: naturaleza, aventura y descanso en un solo lugar. Disponemos de paquetes especiales para escapadas de fin de semana, celebraciones íntimas y retiros de bienestar. Nuestro equipo te puede ayudar a planificar desde una cena privada en la cabaña hasta excursiones a medida. Reservar es sencillo: consulta disponibilidad en línea, elige tu alojamiento y añade servicios opcionales como traslados, cenas o actividades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
