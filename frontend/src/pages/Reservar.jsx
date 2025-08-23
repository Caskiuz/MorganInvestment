import React from 'react';

export default function Reservar() {
  return (
    <section className="max-w-lg mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">Formulario de Reservas</h2>
      <form className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Nombre</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" name="nombre" required />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Número de teléfono</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="tel" name="telefono" required pattern="[0-9]{10,15}" placeholder="Ej: 8112345678" />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Cabaña a rentar</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" name="cabana" required placeholder="Ej: Cabaña Familiar, Suite, etc." />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Fecha de llegada</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="date" name="llegada" required />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Fecha de salida</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="date" name="salida" required />
        </label>
        <label className="flex flex-col text-left">
          <span className="mb-1 font-medium">Valor de la renta</span>
          <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="number" name="valor" required min="0" placeholder="Valor total en MXN" />
        </label>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow-lg transition mt-4" type="submit">Reservar</button>
      </form>
    </section>
  );
}
