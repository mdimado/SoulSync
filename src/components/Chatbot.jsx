import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ChatbotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
      aria-label="Open chatbot"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};

export const ChatbotInterface = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: "Hi! I'm your wellness assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  
  const fetchBotResponse = async (userMessage) => {
    try {
        
      const response = await fetch(`https://d551-103-177-232-33.ngrok-free.app/reflect?prompt=${userMessage}&user_id=${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
       
      });

      const data = await response.text();
      return data || "I'm here to support you. While I'm a demo bot right now, I'm designed to provide guidance and support for your mental wellness journey.";
    } catch (error) {
      console.error('Error fetching response:', error);
      return "Sorry, there was an issue processing your request. Please try again later.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    }]);

    // Fetch bot response from the provided URL
    const botResponse = await fetchBotResponse(inputValue);

    // Add bot response to the messages
    setMessages(prev => [...prev, {
      sender: 'bot',
      content: botResponse,
      timestamp: new Date(),
    }]);

    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Bot className="h-6 w-6" />
          <h3 className="font-semibold">Wellness Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Close chatbot"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
