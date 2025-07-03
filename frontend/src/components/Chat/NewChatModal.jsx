import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconSearch, IconUsers, IconCheck } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers } from '../../store/slices/userSlice';
import { createOrGetPrivateChat, createGroupChat } from '../../store/slices/chatSlice';
import { useNavigate } from 'react-router-dom';

export const NewChatModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (searchQuery.trim()) {
            const timer = setTimeout(async () => {
                setSearching(true);
                try {
                    const response = await dispatch(searchUsers(searchQuery)).unwrap();
                    setSearchResults(response.filter(u => u._id !== user._id));
                } catch (error) {
                                        console.error('Search failed:', error);
                } finally {
                    setSearching(false);
                }
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, dispatch, user._id]);

    const handleSelectUser = (selectedUser) => {
        if (isGroupMode) {
            if (selectedUsers.find(u => u._id === selectedUser._id)) {
                setSelectedUsers(selectedUsers.filter(u => u._id !== selectedUser._id));
            } else {
                setSelectedUsers([...selectedUsers, selectedUser]);
            }
        } else {
            // Create private chat immediately
            handleCreateChat(selectedUser);
        }
    };

    const handleCreateChat = async (selectedUser = null) => {
        try {
            if (isGroupMode && selectedUsers.length >= 2) {
                const chat = await dispatch(createGroupChat({
                    groupName: groupName || 'New Group',
                    participantIds: selectedUsers.map(u => u._id)
                })).unwrap();
                navigate(`/dashboard/messages/${chat._id}`);
                onClose();
            } else if (!isGroupMode && selectedUser) {
                const chat = await dispatch(createOrGetPrivateChat(selectedUser._id)).unwrap();
                navigate(`/dashboard/messages/${chat._id}`);
                onClose();
            }
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const resetModal = () => {
        setSearchQuery('');
        setSelectedUsers([]);
        setGroupName('');
        setIsGroupMode(false);
        setSearchResults([]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">
                            {isGroupMode ? 'Create Group' : 'New Message'}
                        </h2>
                        <button
                            onClick={() => {
                                resetModal();
                                onClose();
                            }}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <IconX size={20} className="text-white/80" />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center p-4 gap-4">
                        <button
                            onClick={() => setIsGroupMode(false)}
                            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                !isGroupMode 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                        >
                            Private Chat
                        </button>
                        <button
                            onClick={() => setIsGroupMode(true)}
                            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                isGroupMode 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                        >
                            <IconUsers size={18} className="inline mr-2" />
                            Group Chat
                        </button>
                    </div>

                    {/* Group Name Input */}
                    {isGroupMode && (
                        <div className="px-4 pb-4">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="px-4 pb-4">
                        <div className="relative">
                            <IconSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Selected Users */}
                    {isGroupMode && selectedUsers.length > 0 && (
                        <div className="px-4 pb-4">
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <motion.div
                                        key={user._id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full"
                                    >
                                        <img 
                                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`} 
                                            alt={user.username}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm text-white">{user.username}</span>
                                        <button
                                            onClick={() => handleSelectUser(user)}
                                            className="hover:bg-white/20 rounded-full p-0.5"
                                        >
                                            <IconX size={14} className="text-white/80" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    <div className="max-h-80 overflow-y-auto">
                        {searching ? (
                            <div className="text-center py-8 text-white/50">
                                Searching...
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(user => {
                                const isSelected = selectedUsers.find(u => u._id === user._id);
                                return (
                                    <motion.button
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full flex items-center p-4 hover:bg-white/10 transition-colors ${
                                            isSelected ? 'bg-blue-500/20' : ''
                                        }`}
                                        whileHover={{ x: 5 }}
                                    >
                                        <img 
                                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`} 
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div className="flex-1 text-left">
                                            <p className="text-white font-medium">{user.username}</p>
                                            <p className="text-white/50 text-sm">{user.fullName || user.email}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <IconCheck size={14} className="text-white" />
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })
                        ) : searchQuery && (
                            <div className="text-center py-8 text-white/50">
                                No users found
                            </div>
                        )}
                    </div>

                    {/* Create Group Button */}
                    {isGroupMode && selectedUsers.length >= 2 && (
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={() => handleCreateChat()}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Create Group ({selectedUsers.length} members)
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};