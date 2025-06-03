import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected routes with layout */}
        <Route element={!user ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<div className="text-white p-4 pt-20 lg:pt-0">Create Post Page - Coming Soon</div>} />
          <Route path="/notifications" element={<div className="text-white p-4 pt-20 lg:pt-0">Notifications Page - Coming Soon</div>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastContainer 
        position="top-right" 
        theme="dark"
        autoClose={3000}
      />
    </>
  );
}

export default App;