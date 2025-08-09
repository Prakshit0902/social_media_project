import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IconSend, 
    IconPaperclip, 
    IconDotsVertical, 
    IconArrowLeft,
    IconMicrophone,
    IconCamera,
    IconFile,
    IconDownload,
    IconCheck,
    IconChecks,
    IconClock,
    IconX,
    IconEdit,
    IconTrash,
    IconArrowBackUp,
    IconSearch,
    IconVolume,
    IconVolumeOff,
    IconCopy,
    IconShare
} from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchChatMessages, 
    sendMessage, 
    markMessagesAsRead,
    setActiveChat,
    setTypingUser,
    uploadMedia,
    deleteMessage,
    editMessage,
    toggleMuteChat,
    searchMessages,
    setReplyingTo,
    setEditingMessage,
    sendAIMessage,
    loadAIMessages
} from '../../store/slices/chatSlice';
import socketService from '../../socket/socket';
import { formatDistanceToNow } from 'date-fns';
import aiChatService from '../../services/aiChatService';

// Message Status Component
const MessageStatus = ({ message, participants, currentUserId }) => {
    if (message.status === 'sending') return <IconClock size={14} className="text-white/50" />;
    if (message.status === 'sent') return <IconCheck size={14} className="text-white/50" />;
    
    const otherParticipants = participants.filter(p => p._id !== currentUserId);
    const allRead = otherParticipants.every(participant => 
        message.readBy?.some(rb => rb.userId === participant._id)
    );
    
    return <IconChecks size={14} className={allRead ? "text-blue-400" : "text-white/50"} />;
};

// Reply Preview Component
const ReplyPreview = ({ replyingTo, onCancel }) => {
    if (!replyingTo) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border-l-4 border-blue-500"
        >
                        <IconArrowBackUp size={18} className="text-blue-500" />
            <div className="flex-1">
                <p className="text-xs text-blue-400">{replyingTo.sender.username}</p>
                <p className="text-sm text-white/60 truncate">
                    {replyingTo.messageType === 'text' ? replyingTo.content : `[${replyingTo.messageType}]`}
                </p>
            </div>
            <IconX 
                size={18} 
                className="text-white/60 cursor-pointer hover:text-white" 
                onClick={onCancel}
            />
        </motion.div>
    );
};

// Message Context Menu
const MessageContextMenu = ({ message, position, onClose, onAction }) => {
    const menuItems = [
        { icon: IconArrowBackUp, label: 'Reply', action: 'reply' },
        { icon: IconCopy, label: 'Copy', action: 'copy' },
        { icon: IconShare, label: 'Forward', action: 'forward' },
        { icon: IconEdit, label: 'Edit', action: 'edit', showFor: 'sender' },
        { icon: IconTrash, label: 'Delete', action: 'delete', showFor: 'sender' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bg-black/90 backdrop-blur-xl rounded-lg shadow-xl py-2 min-w-[150px] z-50"
            style={{ 
                top: position.y, 
                left: position.x,
                transform: 'translateY(-100%)'
            }}
        >
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => onAction(item.action)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <item.icon size={18} />
                    <span className="text-sm">{item.label}</span>
                </button>
            ))}
        </motion.div>
    );
};

// Media Message Component
const MediaMessage = ({ message, isSentByMe }) => {
    const [downloading, setDownloading] = useState(false);
    
    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await fetch(message.content);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = message.mediaInfo?.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
        setDownloading(false);
    };

    if (message.messageType === 'image') {
        return (
            <div className="relative max-w-sm">
                <img 
                    src={message.content} 
                    alt="Shared image" 
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
                />
                <button
                    onClick={handleDownload}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                    <IconDownload size={18} className="text-white" />
                </button>
            </div>
        );
    }

    if (message.messageType === 'video') {
        return (
            <div className="relative max-w-sm">
                <video 
                    controls 
                    className="rounded-lg max-w-full h-auto"
                    preload="metadata"
                >
                    <source src={message.content} />
                </video>
            </div>
        );
    }

    // File message
    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <IconFile size={32} className="text-white/60" />
            <div className="flex-1">
                <p className="text-sm font-medium text-white">
                    {message.mediaInfo?.fileName || 'File'}
                </p>
                <p className="text-xs text-white/50">
                    {message.mediaInfo?.fileSize ? 
                        `${(message.mediaInfo.fileSize / 1024 / 1024).toFixed(2)} MB` : 
                        'Unknown size'
                    }
                </p>
            </div>
            <button
                onClick={handleDownload}
                disabled={downloading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                {downloading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                    <IconDownload size={20} className="text-white/80" />
                )}
            </button>
        </div>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isSentByMe, showSender = false, participants, currentUserId, onContextMenu, onReplyClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
    
    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowMenu(true);
    };

    const handleAction = (action) => {
        setShowMenu(false);
        onContextMenu(action, message);
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} mb-2`}
                onContextMenu={handleContextMenu}
            >
                {showSender && !isSentByMe && (
                    <span className="text-xs text-white/50 mb-1 ml-2">
                        {message.sender?.username}
                    </span>
                )}
                
                {message.replyTo && (
                    <div 
                        className={`flex items-center gap-2 mb-1 px-3 py-1 bg-white/5 rounded-lg cursor-pointer ${
                            isSentByMe ? 'mr-2' : 'ml-2'
                        }`}
                        onClick={() => onReplyClick(message.replyTo._id)}
                    >
                        <IconArrowBackUp size={14} className="text-white/40" />
                        <div className="text-xs text-white/60 max-w-[200px]">
                            <p className="font-medium">{message.replyTo.sender?.username}</p>
                            <p className="truncate">
                                {message.replyTo.messageType === 'text' ? 
                                    message.replyTo.content : 
                                    `[${message.replyTo.messageType}]`
                                }
                            </p>
                        </div>
                    </div>
                )}

                <div className={`flex items-end gap-2 max-w-xs md:max-w-md`}>
                    <div className={`p-3 rounded-2xl ${
                        isSentByMe 
                            ? 'bg-blue-500 text-white rounded-br-lg' 
                            : 'bg-white/10 text-white/90 rounded-bl-lg'
                    }`}>
                        {message.isDeleted ? (
                            <p className="text-sm italic text-white/50">This message was deleted</p>
                        ) : message.messageType === 'text' ? (
                            <>
                                <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                                {message.isEdited && (
                                    <p className="text-xs text-white/50 mt-1">(edited)</p>
                                )}
                            </>
                        ) : (
                            <MediaMessage message={message} isSentByMe={isSentByMe} />
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-xs ${
                                isSentByMe ? 'text-blue-100' : 'text-white/50'
                            }`}>
                                {timeAgo}
                            </p>
                            {isSentByMe && (
                                <MessageStatus 
                                    message={message} 
                                    participants={participants} 
                                    currentUserId={currentUserId} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <AnimatePresence>
                {showMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowMenu(false)}
                        />
                        <MessageContextMenu
                            message={message}
                            position={menuPosition}
                            onClose={() => setShowMenu(false)}
                            onAction={handleAction}
                        />
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// Main ChatWindow Component
export const ChatWindow = ({ activeChatId, onBack }) => {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropZone, setShowDropZone] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { user } = useSelector((state) => state.auth);
    const { 
        chats, 
        messages, 
        messagesLoading, 
        typingUsers, 
        replyingTo,
        editingMessage,
        aiMessages,
        aiLoading,
        searchResults
    } = useSelector((state) => state.chat);
    
    const activeChat = chats.find(chat => chat._id === activeChatId);

    const isAIChat = activeChat?.isAIChat || false;

    const chatMessages = activeChat?.isAIChat 
        ? (aiMessages[activeChatId] || [])
        : (messages[activeChatId] || []);

    
    const typingInThisChat = activeChat?.isAIChat && aiLoading 
        ? [{ _id: aiChatService.AI_BOT_ID, username: 'AI Assistant' }]
        : (typingUsers[activeChatId] || []);

// Load AI messages when chat is selected


    
    // Get chat details
    const isGroup = activeChat?.chatType === 'group';
    const otherParticipant = !isGroup && activeChat ? 
        activeChat.participants.find(p => p._id !== user._id) : null;
    const displayName = isGroup ? activeChat?.groupName : otherParticipant?.username;
    const displayPicture = isGroup ? activeChat?.groupIcon : otherParticipant?.profilePicture;
    const isOnline = !isGroup && otherParticipant?.isOnline;
    const isMuted = activeChat?.mutedBy?.includes(user._id);


    console.log('Active Chat ID:', activeChatId);
    console.log('Is AI Chat:', activeChat?.isAIChat);
    console.log('AI Messages:', aiMessages);
    console.log('Regular Messages:', messages);

    console.log('Chat Messages to display:', chatMessages);
    

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
        if (editingMessage) {
            setNewMessage(editingMessage.content);
        }
    }, [editingMessage]);

    // Socket listeners
    useEffect(() => {
        const handleNewMessage = ({ message, chatId }) => {
            // Only mark as read for non-AI chats
            if (chatId === activeChatId && chatId !== aiChatService.AI_CHAT_ID) {
                dispatch(markMessagesAsRead(chatId));
            }
        };

        const handleUserTyping = ({ userId, chatId, isTyping }) => {
            if (chatId === activeChatId) {
                dispatch(setTypingUser({ chatId, userId, isTyping }));
            }
        };

        const handleMessageDeleted = ({ messageId, chatId, deletedForAll }) => {
            if (deletedForAll && chatId === activeChatId) {
                dispatch(updateMessageInState({ 
                    chatId, 
                    messageId, 
                    updates: { isDeleted: true, content: '' }
                }));
            }
        };

        const handleMessageEdited = ({ message, chatId }) => {
            if (chatId === activeChatId) {
                dispatch(updateMessageInState({ 
                    chatId, 
                    messageId: message._id, 
                    updates: message
                }));
            }
        };

        socketService.on('newMessage', handleNewMessage);
        socketService.on('userTyping', handleUserTyping);
        socketService.on('messageDeleted', handleMessageDeleted);
        socketService.on('messageEdited', handleMessageEdited);

        return () => {
            socketService.off('newMessage', handleNewMessage);
            socketService.off('userTyping', handleUserTyping);
            socketService.off('messageDeleted', handleMessageDeleted);
            socketService.off('messageEdited', handleMessageEdited);
        };
    }, [activeChatId, dispatch]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.emit('typing', { chatId: activeChatId, isTyping: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.emit('typing', { chatId: activeChatId, isTyping: false });
        }, 1000);
    };

useEffect(() => {
    if (activeChatId === aiChatService.AI_CHAT_ID) {
        dispatch(loadAIMessages());
    }
}, [activeChatId, dispatch]);

// Update message fetching logic
useEffect(() => {
    if (activeChatId) {
        dispatch(setActiveChat(activeChatId));
        
        // Debug log to check
        console.log('Active Chat ID:', activeChatId);
        console.log('Is AI Chat:', activeChatId === aiChatService.AI_CHAT_ID);
        
        if (activeChatId === aiChatService.AI_CHAT_ID) {
            // AI chat - load from localStorage
            dispatch(loadAIMessages());
        } else {
            // Regular chat - fetch from backend
            dispatch(fetchChatMessages({ chatId: activeChatId }));
            dispatch(markMessagesAsRead(activeChatId));
        }
    }
}, [activeChatId, dispatch]);

    // Update handleSendMessage
    const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !activeChatId) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    
    // Only emit typing event for non-AI chats
    if (!aiChatService.isAIChat(activeChatId)) {
        socketService.emit('typing', { chatId: activeChatId, isTyping: false });
    }

    if (aiChatService.isAIChat(activeChatId)) {
        // Handle AI chat
        await dispatch(sendAIMessage(newMessage.trim()));
    } else if (editingMessage) {
        // Edit message
        await dispatch(editMessage({ 
            messageId: editingMessage._id, 
            content: newMessage.trim() 
        }));
        dispatch(setEditingMessage(null));
    } else {
        // Send regular message
        await dispatch(sendMessage({ 
            chatId: activeChatId, 
            content: newMessage.trim(),
            replyTo: replyingTo?._id
        }));
        dispatch(setReplyingTo(null));
    }
    
    setNewMessage('');
};

// Update messages display


    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            await dispatch(uploadMedia({ 
                chatId: activeChatId, 
                file,
                replyTo: replyingTo?._id
            }));
        }
        dispatch(setReplyingTo(null));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setShowDropZone(false);
        
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            await dispatch(uploadMedia({ 
                chatId: activeChatId, 
                file,
                replyTo: replyingTo?._id
            }));
        }
        dispatch(setReplyingTo(null));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setShowDropZone(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setShowDropZone(false);
    };

    const handleContextMenuAction = async (action, message) => {
        switch (action) {
            case 'reply':
                dispatch(setReplyingTo(message));
                break;
            case 'copy':
                if (message.messageType === 'text') {
                    navigator.clipboard.writeText(message.content);
                }
                break;
            case 'edit':
                if (message.sender._id === user._id && message.messageType === 'text') {
                    dispatch(setEditingMessage(message));
                }
                break;
            case 'delete':
                if (message.sender._id === user._id) {
                    const deleteForAll = window.confirm('Delete for everyone?');
                    await dispatch(deleteMessage({ 
                        messageId: message._id, 
                        deleteForAll 
                    }));
                }
                break;
            default:
                break;
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            dispatch(searchMessages({ chatId: activeChatId, query }));
        }
    };

    const handleToggleMute = async () => {
        await dispatch(toggleMuteChat(activeChatId));
    };

    const scrollToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-message');
            setTimeout(() => {
                element.classList.remove('highlight-message');
            }, 2000);
        }
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <IconSearch size={20} className="text-white/80"/>
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={handleToggleMute}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        {isMuted ? (
                            <IconVolumeOff size={20} className="text-white/80"/>
                        ) : (
                            <IconVolume size={20} className="text-white/80"/>
                        )}
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <IconDotsVertical size={20} className="text-white/80"/>
                    </motion.button>
                </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-3">
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Messages Area */}
            <div className="flex-grow p-4 md:p-6 space-y-2 overflow-y-auto flex flex-col relative">
                {/* Drop Zone Overlay */}
                <AnimatePresence>
                    {showDropZone && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-500"
                        >
                            <div className="text-center">
                                <IconFile size={48} className="text-blue-500 mx-auto mb-2" />
                                <p className="text-white font-medium">Drop files here to send</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {messagesLoading && chatMessages.length === 0 ? (
                    <div className="text-center text-white/50">Loading messages...</div>
                ) : chatMessages.length === 0 ? (
                    <div className="text-center text-white/50">No messages yet. Start a conversation!</div>
                ) : (
                    chatMessages.map((msg, index) => {
                        const showSender = isGroup && 
                            (index === 0 || chatMessages[index - 1].sender._id !== msg.sender._id);
                        
                        return (
                            <div key={msg._id} id={`message-${msg._id}`}>
                                <MessageBubble 
                                    message={msg} 
                                    isSentByMe={msg.sender._id === user._id}
                                    showSender={showSender}
                                    participants={activeChat.participants}
                                    currentUserId={user._id}
                                    onContextMenu={handleContextMenuAction}
                                    onReplyClick={scrollToMessage}
                                />
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            <AnimatePresence>
                {replyingTo && (
                    <ReplyPreview 
                        replyingTo={replyingTo} 
                        onCancel={() => dispatch(setReplyingTo(null))} 
                    />
                )}
            </AnimatePresence>

            {/* Edit Preview */}
            <AnimatePresence>
                {editingMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border-l-4 border-yellow-500"
                    >
                        <IconEdit size={18} className="text-yellow-500" />
                        <div className="flex-1">
                            <p className="text-xs text-yellow-400">Editing message</p>
                            <p className="text-sm text-white/60 truncate">{editingMessage.content}</p>
                        </div>
                        <IconX 
                            size={18} 
                            className="text-white/60 cursor-pointer hover:text-white" 
                            onClick={() => {
                                dispatch(setEditingMessage(null));
                                setNewMessage('');
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Input Form */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    <motion.button 
                        type="button" 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => fileInputRef.current?.click()}
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
                        placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
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