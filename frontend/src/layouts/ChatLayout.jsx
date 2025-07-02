import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { ChatList } from "../components/Chat/ChatList";
import { ChatWindow } from "../components/Chat/ChatWindow";
import { AuroraBackground } from "../components/ui/aurora-background";
import { motion } from "framer-motion";
import { NavBar } from "../components/NavBar/NavBar";
import { useDispatch } from "react-redux";
import socketService from "../socket/socket";
import { addNewMessage, setUserOnline, setUserOffline } from "../store/slices/chatSlice";

export function ChatLayout() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeChatId, setActiveChatId] = useState(params.chatId || null);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();

    // Set up global socket listeners
    socketService.on('newMessage', ({ message, chatId }) => {
      dispatch(addNewMessage({ message, chatId }));
    });

    socketService.on('userOnline', (userId) => {
      dispatch(setUserOnline(userId));
    });

    socketService.on('userOffline', (userId) => {
      dispatch(setUserOffline(userId));
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  // Update state if the URL param changes
  useEffect(() => {
    setActiveChatId(params.chatId || null);
  }, [params.chatId]);

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    navigate(`/dashboard/messages/${chatId}`, { replace: true });
  };

  const handleBackToList = () => {
    setActiveChatId(null);
    navigate('/dashboard/messages', { replace: true });
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Background from your Dashboard Layout */}
      <div className="fixed inset-0 w-full h-full z-0">
        <AuroraBackground />
      </div>

      <main className="relative flex-1 flex h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] w-full max-w-7xl mx-auto p-0 sm:p-4">
        {/* --- Responsive Container --- */}
        <div className="flex w-full h-full gap-4">
          
          {/* CHAT LIST (Sidebar on Desktop, Full screen on Mobile) */}
          <div className={`
            w-full md:w-1/3 md:max-w-sm h-full
            ${activeChatId ? 'hidden md:flex' : 'flex'}
          `}>
            <ChatList onSelectChat={handleSelectChat} activeChatId={activeChatId} />
          </div>

          {/* CHAT WINDOW (Shows on Desktop, or when a chat is selected on Mobile) */}
          <div className={`
            w-full md:flex-grow h-full
            ${activeChatId ? 'flex' : 'hidden md:flex'}
          `}>
            <ChatWindow 
              key={activeChatId}
              activeChatId={activeChatId} 
              onBack={handleBackToList}
            />
          </div>
        </div>
      </main>

      {/* Fixed navbar at bottom */}
      <div className="relative z-50">
        <NavBar />
      </div>
    </div>
  );
}