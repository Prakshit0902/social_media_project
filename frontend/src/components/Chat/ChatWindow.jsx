import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconSend, IconPaperclip, IconDotsVertical, IconArrowLeft } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchChatMessages, 
    sendMessage, 
    markMessagesAsRead,
    setActiveChat,
    setTypingUser
} from '../../store/slices/chatSlice';
import socketService from '../../socket/socket';
import { formatDistanceToNow } from 'date-fns';

const MessageBubble = ({ message, isSentByMe, showSender = false }) => {
    const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} mb-2`}
        >
            {showSender && !isSentByMe && (
                <span className="text-xs text-white/50 mb-1 ml-2">
                    {message.sender?.username}
                </span>
            )}
            <div className={`flex items-end gap-2 max-w-xs md:max-w-md`}>
                <div className={`p-3 rounded-2xl ${
                    isSentByMe 
                        ? 'bg-blue-500 text-white rounded-br-lg' 
                        : 'bg-white/10 text-white/90 rounded-bl-lg'
                }`}>
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                        isSentByMe ? 'text-blue-100' : 'text-white/50'
                    }`}>
                        {timeAgo}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export const ChatWindow = ({ activeChatId, onBack }) => {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const { user } = useSelector((state) => state.auth);
    const { chats, messages, messagesLoading, typingUsers } = useSelector((state) => state.chat);
    
    const activeChat = chats.find(chat => chat._id === activeChatId);
    const chatMessages = messages[activeChatId] || [];
    const typingInThisChat = typingUsers[activeChatId] || [];
    
    // Get chat details
    const isGroup = activeChat?.chatType === 'group';
    const otherParticipant = !isGroup && activeChat ? 
        activeChat.participants.find(p => p._id !== user._id) : null;
    const displayName = isGroup ? activeChat?.groupName : otherParticipant?.username;
    const displayPicture = isGroup ? activeChat?.groupIcon : otherParticipant?.profilePicture;
    const isOnline = !isGroup && otherParticipant?.isOnline;

    useEffect(() => {
        if (activeChatId) {
            dispatch(setActiveChat(activeChatId));
            dispatch(fetchChatMessages({ chatId: activeChatId }));
            dispatch(markMessagesAsRead(activeChatId));
        }
    }, [activeChatId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        // Socket listeners for real-time updates
        const handleNewMessage = ({ message, chatId }) => {
            if (chatId === activeChatId) {
                dispatch(markMessagesAsRead(chatId));
            }
        };

        const handleUserTyping = ({ userId, chatId, isTyping }) => {
            if (chatId === activeChatId) {
                dispatch(setTypingUser({ chatId, userId, isTyping }));
            }
        };

        socketService.on('newMessage', handleNewMessage);
        socketService.on('userTyping', handleUserTyping);

        return () => {
            socketService.off('newMessage', handleNewMessage);
            socketService.off('userTyping', handleUserTyping);
        };
    }, [activeChatId, dispatch]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.emit('typing', { chatId: activeChatId, isTyping: true });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.emit('typing', { chatId: activeChatId, isTyping: false });
        }, 1000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeChatId) return;

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);
        socketService.emit('typing', { chatId: activeChatId, isTyping: false });

        // Send message
        await dispatch(sendMessage({ 
            chatId: activeChatId, 
            content: newMessage.trim() 
        }));
        
        setNewMessage('');
    };
    
    if (!activeChatId) {
        return (
            <div className="w-full h-full hidden md:flex items-center justify-center backdrop-blur-2xl bg-black/20 rounded-3xl border border-white/10">
                <p className="text-white/50 text-center px-4">
                    Select a conversation<br/>to start messaging.
                </p>
            </div>
        );
    }

    if (!activeChat) {
        return (
            <div className="w-full h-full flex items-center justify-center backdrop-blur-2xl bg-black/20 rounded-3xl border border-white/10">
                <p className="text-white/50">Loading chat...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full flex flex-col backdrop-blur-2xl bg-black/20 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center p-3 sm:p-4 border-b border-white/10 bg-black/20">
                <button 
                    onClick={onBack} 
                    className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors md:hidden"
                >
                    <IconArrowLeft size={22} className="text-white"/>
                </button>
                <img 
                    src={displayPicture || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                    alt={displayName} 
                    className="w-10 h-10 rounded-full object-cover mr-4 bg-black/20"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-white">{displayName}</h3>
                    <p className="text-xs text-white/50">
                        {typingInThisChat.length > 0 
                            ? 'Typing...' 
                            : (isOnline ? 'Online' : 'Offline')
                        }
                    </p>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <IconDotsVertical size={20} className="text-white/80"/>
                </motion.button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-grow p-4 md:p-6 space-y-2 overflow-y-auto flex flex-col">
                {messagesLoading && chatMessages.length === 0 ? (
                    <div className="text-center text-white/50">Loading messages...</div>
                ) : chatMessages.length === 0 ? (
                    <div className="text-center text-white/50">No messages yet. Start a conversation!</div>
                ) : (
                    chatMessages.map((msg, index) => {
                        const showSender = isGroup && 
                            index === 0 || 
                            (index > 0 && chatMessages[index - 1].sender._id !== msg.sender._id);
                        
                                                return (
                            <MessageBubble 
                                key={msg._id} 
                                message={msg} 
                                isSentByMe={msg.sender._id === user._id}
                                showSender={showSender}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <motion.button 
                        type="button" 
                        whileTap={{ scale: 0.9 }} 
                        className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <IconPaperclip size={22} className="text-white/60"/>
                    </motion.button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="w-full bg-white/5 border border-transparent rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors disabled:bg-blue-500/50 disabled:cursor-not-allowed"
                        disabled={!newMessage.trim()}
                    >
                        <IconSend size={22} className="text-white"/>
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};
                            