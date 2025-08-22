import React, { useState, useEffect } from 'react';

export default function ChatbotFlotante() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'faq', 'chat'
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const isInStore = typeof window !== 'undefined' && window.location.pathname.includes('/tienda');

  // Preguntas frecuentes (puedes editar para adaptarlas al proyecto)
  const faqs = [
    { id: 1, question: '¿Qué servicios ofrecen?', answer: 'Ofrecemos servicio de reservaciones y atención personalizada. Podemos cotizar proyectos y asesoría.' },
    { id: 2, question: '¿Cómo reservo?', answer: 'Puedes ir a la sección "Reservar" en el sitio, elegir la fecha y completar tus datos. También te podemos ayudar por WhatsApp.' },
    { id: 3, question: '¿Cobran por desplazamiento?', answer: 'Depende de la ubicación. Contáctanos por WhatsApp para darte una respuesta rápida y cotización.' }
  ];

  useEffect(() => {
    if (isOpen && showWelcome) {
      const welcomeMessage = {
        id: Date.now(),
        text: isInStore
          ? '¡Hola! 👋 Soy el asistente. ¿Te ayudo con los productos de la tienda?'
          : '¡Hola! 👋 Soy el asistente del sitio. ¿En qué puedo ayudarte?',
        sender: 'bot',
        timestamp: new Date()
      };

      const optionsMessage = {
        id: Date.now() + 1,
        text: 'Puedes preguntar por:',
        sender: 'bot',
        timestamp: new Date(),
        showOptions: true
      };

      setMessages([welcomeMessage, optionsMessage]);
      setShowWelcome(false);
    }
  }, [isOpen, showWelcome, isInStore]);

  const handleFaqClick = (faq) => {
    const userMessage = { id: Date.now(), text: faq.question, sender: 'user', timestamp: new Date() };
    const botResponse = { id: Date.now() + 1, text: faq.answer, sender: 'bot', timestamp: new Date() };
    const moreHelp = { id: Date.now() + 2, text: '¿Te ayudo con algo más?', sender: 'bot', timestamp: new Date(), showOptions: true };

    setMessages(prev => [...prev, userMessage, botResponse, moreHelp]);
    setCurrentView('chat');

    // pequeño delay para scroll o efectos futuros
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 200);
  };

  const handleWhatsApp = () => {
    let message = '¡Hola! Me interesa información sobre ';
    message += isInStore ? 'los productos de la tienda.' : 'los servicios de reservación.';

    // Abre el chat de WhatsApp (usa wa.link o wa.me con tu número si lo prefieres)
    const url = `https://wa.link/gpu01d?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const resetChat = () => {
    setCurrentView('chat');
    setMessages([]);
    setShowWelcome(true);
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = 0;
    }, 100);
  };

  const toggleChat = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) setCurrentView('chat');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          <div className="bg-[#6FAD46] text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🌿</div>
              <div>
                <h3 className="font-semibold">Asistente</h3>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white p-1 rounded hover:bg-white/20">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {currentView === 'menu' && (
              <div className="p-4 h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-[#6FAD46] rounded-full flex items-center justify-center mx-auto mb-2">🌿</div>
                  <h4 className="font-semibold text-gray-800">¿Cómo te puedo ayudar?</h4>
                  <p className="text-sm text-gray-600">Selecciona una opción:</p>
                </div>

                <div className="space-y-2 flex-1">
                  <button onClick={() => setCurrentView('faq')} className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">❓ Preguntas Frecuentes</button>
                  <button onClick={handleWhatsApp} className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left">💬 Chatear por WhatsApp</button>
                </div>
              </div>
            )}

            {currentView === 'faq' && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Preguntas Frecuentes</h4>
                  <button onClick={() => setCurrentView('menu')} className="text-gray-500">←</button>
                </div>
                <div className="space-y-2">
                  {faqs.map(faq => (
                    <button key={faq.id} onClick={() => handleFaqClick(faq)} className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">{faq.question}</button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button onClick={handleWhatsApp} className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">¿No encuentras tu respuesta? Chatea con nosotros</button>
                </div>
              </div>
            )}

            {currentView === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 space-y-3" id="messages-container">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#6FAD46] text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <button onClick={resetChat} className="flex-1 p-2 bg-gray-200 rounded">🔄 Nuevo chat</button>
                    <button onClick={handleWhatsApp} className="p-2 bg-green-500 text-white rounded">💬 WhatsApp</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="relative group">
          <div className="absolute inset-0 animate-ping">
            <div className="w-14 h-14 bg-[#6FAD46] rounded-full opacity-75"></div>
          </div>

          <button onClick={toggleChat} className="relative w-14 h-14 bg-[#6FAD46] hover:bg-[#5a9639] rounded-full shadow-lg flex items-center justify-center text-white text-xl">
            💬
          </button>
        </div>
      )}
    </div>
  );
}
