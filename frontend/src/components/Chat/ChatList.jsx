import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserChats } from '../../store/slices/chatSlice';
import { formatDistanceToNow } from 'date-fns';
import { NewChatModal } from './NewChatModal';

const ChatListItem = ({ chat, onSelect, isActive }) => {
    const currentUser = useSelector(state => state.auth.user);

    
    
    // Determine display info
    const isGroup = chat.chatType === 'group';
    const otherParticipant = !isGroup ? chat.participants.find(p => p._id !== currentUser._id) : null;
    const displayName = isGroup ? chat.groupName : otherParticipant?.username;
    const displayPicture = isGroup ? chat.groupIcon : otherParticipant?.profilePicture;
    
    // Format last message
    const lastMessageContent = chat.lastMessage?.content || 'No messages yet';
    const lastMessagePrefix = chat.lastMessage?.sender === currentUser._id ? "You: " : "";
    
    // Unread count
    const unreadCount = chat.unreadCount || 0;

    // Format timestamp
    // Format timestamp
    const timeAgo = chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true }) : '';

    return (
        <motion.div
            onClick={() => onSelect(chat._id)}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                isActive ? 'bg-blue-500/20' : 'hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.98 }}
            layout
        >
            <img 
                src={displayPicture || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                alt={displayName} 
                className="w-12 h-12 rounded-full object-cover mr-4 bg-black/20"
            />
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white truncate">{displayName}</h4>
                    <span className="text-xs text-white/50 flex-shrink-0 ml-2">{timeAgo}</span>
                </div>
                <div className="flex justify-between items-start mt-1">
                    <p className="text-sm text-white/60 truncate pr-2">
                        {lastMessagePrefix}{lastMessageContent}
                    </p>
                    {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const ChatList = ({ onSelectChat, activeChatId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { chats, loading } = useSelector((state) => state.chat);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    useEffect(() => {
        if (user) {
            dispatch(fetchUserChats());
        }
    }, [dispatch, user]);
    
    const filteredChats = useMemo(() => {
        if (!searchQuery) return chats;
        return chats.filter(chat => {
            const isGroup = chat.chatType === 'group';
            const name = isGroup 
                ? chat.groupName 
                : chat.participants.find(p => p._id !== user._id)?.username;
            return name?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [searchQuery, chats, user]);

    if (loading && chats.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center backdrop-blur-2xl bg-black/30 rounded-3xl">
                <div className="text-white/50">Loading chats...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full flex flex-col backdrop-blur-2xl bg-black/30 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
            <div className="p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Messages</h2>
                        <motion.button 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => setShowNewChatModal(true)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <IconPlus size={22} className="text-white/80"/>
                        </motion.button>

                        <NewChatModal 
                            isOpen={showNewChatModal} 
                            onClose={() => setShowNewChatModal(false)} 
                        />
                </div>
                <div className="relative">
                    <IconSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                    />
                </div>
            </div>
            
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="text-center text-white/50 py-8">
                        {searchQuery ? 'No chats found' : 'No conversations yet'}
                    </div>
                ) : (
                    filteredChats.map(chat => (
                        <ChatListItem 
                            key={chat._id} 
                            chat={chat} 
                            onSelect={onSelectChat} 
                            isActive={chat._id === activeChatId} 
                        />
                    ))
                )}
            </div>
        </motion.div>
    );
};