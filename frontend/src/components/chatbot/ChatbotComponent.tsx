import React, { useState, useRef, useEffect } from 'react';
import { openAiResponse } from 'src/index';
import chatbotImg from 'src/assets/images/chabot/Chatbot Chat Message.jpg';

const ChatbotPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (open && popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, from: 'user' as const };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');

    try {
      const response = await openAiResponse(JSON.stringify(input));

      const choices = response?.response?.choices ?? [];

      let content = 'Napaka pri odgovoru';
      if (choices.length > 0) {
        content = choices[0]?.message?.content ?? content;
      }

      setMessages((msgs) => [...msgs, { text: content, from: 'bot' as const }]);
    } catch (error) {
      setMessages((msgs) => [...msgs, { text: 'Napaka pri povezavi z backendom.', from: 'bot' as const }]);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <img className="w-8 h-8 rounded-full" src={chatbotImg} alt="ChatBot" />
      </button>

      {open && (
        <div
          ref={popupRef}
          className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-fadeIn"
          style={{ minHeight: 420, maxHeight: 520 }}
        >
          <div className="bg-blue-600 text-white py-2 px-4 flex justify-between items-center">
            <span>Omrežninko</span>
            <button onClick={() => setOpen(false)} className="ml-2 text-xl">
              &times;
            </button>
          </div>
          <div className="flex-1 px-4 py-2 overflow-y-auto" style={{ maxHeight: 350 }}>
            {messages.length === 0 && <div className="text-gray-400 text-center mt-12">Začni pogovor</div>}
            {messages.map((msg, i) => (
              <div key={i} className={`my-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-xl px-3 py-2 max-w-[70%] ${
                    msg.from === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <form
            className="flex border-t p-2 bg-gray-50"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1 mr-2 focus:outline-blue-400"
              placeholder="Napiši sporočilo..."
              autoFocus
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
              Pošlji
            </button>
          </form>
        </div>
      )}

      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.25s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </>
  );
};

export default ChatbotPopup;
