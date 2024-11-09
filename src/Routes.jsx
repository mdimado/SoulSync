import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Register';
import Home from './components/Home';
import ChatPage from './components/ChatPage';
import Forum from './components/Forum';
import PrivateRoute from './components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />

<Route
  path="/chat/:id"
  element={
    <PrivateRoute>
      <ChatPage />
    </PrivateRoute>
  }
/>

      <Route
        path="/forum"
        element={
          <PrivateRoute>
            <Forum />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
