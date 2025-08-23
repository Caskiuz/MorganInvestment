import TestimonioForm from './components/landing/TestimonioForm';

import React, { useRef, useEffect } from 'react';
import setupAOS from './setupAOS';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Galeria from './pages/Galeria';
import Reservar from './pages/Reservar';
import Contacto from './pages/Contacto';
import ChatbotFlotante from './components/ChatbotFlotante';
import Ofertas from './components/landing/Ofertas';
import Actividades from './components/landing/Actividades';
import Testimonios from './components/landing/Testimonios';
import FAQ from './components/landing/FAQ';
import Newsletter from './components/landing/Newsletter';

function App() {
  useEffect(() => {
    setupAOS();
  }, []);

  // Referencias para scroll suave
  const refs = {
    home: useRef(null),
    about: useRef(null),
    galeria: useRef(null),
    portafolio: useRef(null),
    reservar: useRef(null),
    contacto: useRef(null),
  };

  // Función para scroll suave a la sección
  const scrollToSection = (section) => {
    if (refs[section]?.current) {
      refs[section].current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNav={scrollToSection} />
      <main className="flex-1 bg-white">
        <section ref={refs.home} id="home" data-aos="fade-up" className="mb-0 p-0 m-0"><Hero onReservar={() => scrollToSection('reservar')} /></section>
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <section className="mb-8 p-0 m-0"><Home /></section>
          <section ref={refs.about} id="about" data-aos="fade-up"><About /></section>
          {/* Título eliminado para evitar duplicado, ya viene en el componente Galeria */}
          <section ref={refs.galeria} id="galeria" data-aos="fade-up" className="mt-4"><Galeria /></section>
          {/* Portafolio puede ir aquí si se usa */}
          <div data-aos="fade-up"><Testimonios /></div>
          <div data-aos="fade-up"><TestimonioForm /></div>
          <div data-aos="fade-up"><Newsletter /></div>
          <section ref={refs.contacto} id="contacto" data-aos="fade-up"><Contacto /></section>
        </div>
      </main>
      <Footer />
      <ChatbotFlotante />
    </div>
  );
}

export default App;
