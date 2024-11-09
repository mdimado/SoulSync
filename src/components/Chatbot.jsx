import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ChatBot = () => {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reflect?prompt=${userMessage}&user_id=${user.uid}&days=0`, {
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

    // Fetch bot response
    const botResponse = await fetchBotResponse(inputValue);

    // Add bot response
    setMessages(prev => [...prev, {
      sender: 'bot',
      content: botResponse,
      timestamp: new Date(),
    }]);

    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-white">
          <Bot className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Support Assistant</h1>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full bg-white shadow-lg rounded-lg my-4 flex flex-col">
        {/* Messages */}
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
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;