import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import NavBar from './components/NavBar';
import Routes from './Routes';
import { ChatbotButton, ChatbotInterface } from './components/Chatbot';

const App = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <NavBar />
          <Routes />
          <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
          <ChatbotInterface 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;