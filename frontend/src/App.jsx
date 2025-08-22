import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Galeria from './pages/Galeria';
import Reservar from './pages/Reservar';
import Contacto from './pages/Contacto';
import ChatbotFlotante from './components/ChatbotFlotante';
import Login from './pages/Login';

function App() {
  const [page, setPage] = React.useState('home');

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNav={setPage} />
      <main className="flex-1">
        {page === 'home' && <>
          <Hero onReservar={() => setPage('reservar')} />
          <Home />
        </>}
        {page === 'about' && <About />}
        {page === 'galeria' && <Galeria />}
        {page === 'reservar' && <Reservar />}
        {page === 'contacto' && <Contacto />}
        {page === 'login' && <Login />}
      </main>

      <Footer />

      {/* Chatbot flotante global */}
      <ChatbotFlotante />
    </div>
  );
}

export default App;
