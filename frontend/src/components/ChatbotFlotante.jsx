import React, { useState, useEffect, useRef } from 'react';

export default function ChatbotFlotante() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'menu', 'faq', 'chat'
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

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
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
      if (inputRef.current) inputRef.current.focus();
    }, 200);
  };
  // Simulación de respuesta para preguntas escritas
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    // Respuesta simulada
    const botResponse = { id: Date.now() + 1, text: 'Gracias por tu pregunta. Pronto un asesor te responderá o usa WhatsApp para atención inmediata.', sender: 'bot', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput("");
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
      if (inputRef.current) inputRef.current.focus();
    }, 200);
  };

  const handleWhatsApp = () => {
    let message = '¡Hola! Me interesa información sobre ';
    message += isInStore ? 'los productos de la tienda.' : 'los servicios de reservación.';

    // Abre el chat de WhatsApp sin número, solo con el mensaje
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
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
    if (willOpen) {
      setCurrentView('chat');
      setShowWelcome(true);
    }
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
            {/* Vista menú eliminada, ahora siempre inicia en chat con bienvenida */}

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
                  {messages.map((msg, idx) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl shadow ${msg.sender === 'user' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-white text-gray-800 border border-gray-100'} ${msg.showOptions ? 'border-green-200' : ''}`}
                        style={msg.showOptions ? {boxShadow:'0 0 0 2px #bbf7d0'} : {}}>
                        <p className={`text-sm whitespace-pre-line ${msg.showOptions ? 'font-semibold text-green-700 mb-2' : ''}`}>{msg.text}</p>
                        {/* Si es el mensaje de opciones, mostrar chips de ejemplo */}
                        {msg.showOptions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {faqs.map(faq => (
                              <button
                                key={faq.id}
                                onClick={() => handleFaqClick(faq)}
                                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full border border-green-300 text-xs font-medium shadow-sm transition flex items-center gap-1"
                                style={{boxShadow:'0 1px 2px #bbf7d0'}}
                              >
                                <span>❓</span> {faq.question}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form className="p-2 border-t bg-gray-50 flex gap-2 items-center" onSubmit={handleSend} autoComplete="off">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                    placeholder="Escribe tu pregunta..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                  />
                  <button type="submit" className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition">Enviar</button>
                  <button type="button" onClick={resetChat} className="p-2 bg-gray-200 rounded ml-1" title="Nuevo chat">🔄</button>
                  <button type="button" onClick={handleWhatsApp} className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded ml-1 border border-green-300" title="WhatsApp"><span className="text-lg">💬</span></button>
                </form>
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
