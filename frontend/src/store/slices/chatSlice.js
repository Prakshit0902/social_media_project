import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosPrivate } from '../../utils/api';

const initialState = {
    chats: [],
    activeChat: null,
    messages: {},
    loading: false,
    messagesLoading: false,
    error: null,
    typingUsers: {}, // { chatId: [userId1, userId2] }
    onlineUsers: []
};

export const createGroupChat = createAsyncThunk(
    'chat/createGroup',
    async ({ groupName, participantIds }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post('/api/v1/chat/group', { 
                groupName, 
                participantIds 
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create group');
        }
    }
);

// Upload media
export const uploadMedia = createAsyncThunk(
    'chat/uploadMedia',
    async ({ chatId, file, replyTo }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatId', chatId);
            if (replyTo) formData.append('replyTo', replyTo);

            const response = await axiosPrivate.post('/api/v1/chat/message/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload media');
        }
    }
);

// Delete message
export const deleteMessage = createAsyncThunk(
    'chat/deleteMessage',
    async ({ messageId, deleteForAll }, { rejectWithValue }) => {
        try {
            await axiosPrivate.delete(`/api/v1/chat/message/${messageId}`, {
                data: { deleteForAll }
            });
            return { messageId, deleteForAll };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
        }
    }
);

// Edit message
export const editMessage = createAsyncThunk(
    'chat/editMessage',
    async ({ messageId, content }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.patch(`/api/v1/chat/message/${messageId}`, {
                content
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to edit message');
        }
    }
);

// Toggle mute
export const toggleMuteChat = createAsyncThunk(
    'chat/toggleMute',
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.patch(`/api/v1/chat/${chatId}/mute`);
            return { chatId, isMuted: response.data.data.isMuted };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle mute');
        }
    }
);

// Search messages
export const searchMessages = createAsyncThunk(
    'chat/searchMessages',
    async ({ chatId, query }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(`/api/v1/chat/${chatId}/search?query=${query}`);
            return { chatId, results: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);
// Fetch user chats
export const fetchUserChats = createAsyncThunk(
    'chat/fetchChats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get('/api/v1/chat');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
        }
    }
);

// Create or get private chat
export const createOrGetPrivateChat = createAsyncThunk(
    'chat/createPrivate',
    async (participantId, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post('/api/v1/chat/private', { participantId });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
        }
    }
);

// Fetch chat messages
export const fetchChatMessages = createAsyncThunk(
    'chat/fetchMessages',
    async ({ chatId, page = 1 }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(`/api/v1/chat/${chatId}/messages?page=${page}`);
            return { chatId, messages: response.data.data, page };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

// Send message
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ chatId, content, messageType = 'text' }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post('/api/v1/chat/message', {
                chatId,
                content,
                messageType
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
    'chat/markAsRead',
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.patch(`/api/v1/chat/${chatId}/read`);
            return { chatId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark messages as read');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChat = action.payload;
        },
        addNewMessage: (state, action) => {
            const { message, chatId } = action.payload;
            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }
            state.messages[chatId].push(message);
            
            // Update last message in chats list
            const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = message;
                state.chats[chatIndex].lastMessageAt = message.createdAt;
                
                // Move chat to top
                const [chat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(chat);
            }
        },
        updateUnreadCount: (state, action) => {
            const { chatId, count } = action.payload;
            const chat = state.chats.find(c => c._id === chatId);
            if (chat) {
                chat.unreadCount = count;
            }
        },
        setTypingUser: (state, action) => {
            const { chatId, userId, isTyping } = action.payload;
            if (!state.typingUsers[chatId]) {
                state.typingUsers[chatId] = [];
            }
            if (isTyping && !state.typingUsers[chatId].includes(userId)) {
                state.typingUsers[chatId].push(userId);
            } else if (!isTyping) {
                state.typingUsers[chatId] = state.typingUsers[chatId].filter(id => id !== userId);
            }
        },
        setUserOnline: (state, action) => {
            if (!state.onlineUsers.includes(action.payload)) {
                state.onlineUsers.push(action.payload);
            }
        },
        setUserOffline: (state, action) => {
            state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
        },
        resetChatState: () => initialState,
        setReplyingTo: (state, action) => {
            state.replyingTo = action.payload;
        },
        setEditingMessage: (state, action) => {
            state.editingMessage = action.payload;
        },
        updateUploadProgress: (state, action) => {
            const { tempId, progress } = action.payload;
            if (state.uploadingFiles[tempId]) {
                state.uploadingFiles[tempId].progress = progress;
            }
        },
        addUploadingFile: (state, action) => {
            const { tempId, file } = action.payload;
            state.uploadingFiles[tempId] = { file, progress: 0 };
        },
        removeUploadingFile: (state, action) => {
            delete state.uploadingFiles[action.payload];
        },
        updateMessageInState: (state, action) => {
            const { chatId, messageId, updates } = action.payload;
            if (state.messages[chatId]) {
                const messageIndex = state.messages[chatId].findIndex(m => m._id === messageId);
                if (messageIndex !== -1) {
                    state.messages[chatId][messageIndex] = {
                        ...state.messages[chatId][messageIndex],
                        ...updates
                    };
                }
            }
        },
        removeMessageFromState: (state, action) => {
            const { chatId, messageId } = action.payload;
            if (state.messages[chatId]) {
                state.messages[chatId] = state.messages[chatId].filter(m => m._id !== messageId);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch chats
            .addCase(fetchUserChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload;
            })
            .addCase(fetchUserChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Create private chat
            .addCase(createOrGetPrivateChat.fulfilled, (state, action) => {
                const existingChat = state.chats.find(chat => chat._id === action.payload._id);
                if (!existingChat) {
                    state.chats.unshift(action.payload);
                }
            })
            
            // Fetch messages
            .addCase(fetchChatMessages.pending, (state) => {
                state.messagesLoading = true;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.messagesLoading = false;
                const { chatId, messages, page } = action.payload;
                if (page === 1) {
                    state.messages[chatId] = messages;
                } else {
                    state.messages[chatId] = [...messages, ...(state.messages[chatId] || [])];
                }
            })
            .addCase(fetchChatMessages.rejected, (state) => {
                state.messagesLoading = false;
            })
            
            // Send message
            .addCase(sendMessage.fulfilled, (state, action) => {
                const message = action.payload;
                const chatId = message.chatId;
                
                if (!state.messages[chatId]) {
                    state.messages[chatId] = [];
                }
                state.messages[chatId].push(message);
                
                // Update chat's last message
                const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
                if (chatIndex !== -1) {
                    state.chats[chatIndex].lastMessage = message;
                    state.chats[chatIndex].lastMessageAt = message.createdAt;
                    
                    // Move chat to top
                    const [chat] = state.chats.splice(chatIndex, 1);
                    state.chats.unshift(chat);
                }
            })
            
            // Mark as read
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                const { chatId } = action.payload;
                const chat = state.chats.find(c => c._id === chatId);
                if (chat) {
                    chat.unreadCount = 0;
                }
            })
             .addCase(createGroupChat.fulfilled, (state, action) => {
                state.chats.unshift(action.payload);
            })
            
            // Upload media
            .addCase(uploadMedia.fulfilled, (state, action) => {
                const message = action.payload;
                const chatId = message.chatId;
                
                if (!state.messages[chatId]) {
                    state.messages[chatId] = [];
                }
                state.messages[chatId].push(message);
                
                // Update chat's last message
                const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
                if (chatIndex !== -1) {
                    state.chats[chatIndex].lastMessage = message;
                    state.chats[chatIndex].lastMessageAt = message.createdAt;
                    
                    const [chat] = state.chats.splice(chatIndex, 1);
                    state.chats.unshift(chat);
                }
            })
            
            // Toggle mute
            .addCase(toggleMuteChat.fulfilled, (state, action) => {
                const { chatId, isMuted } = action.payload;
                const chat = state.chats.find(c => c._id === chatId);
                if (chat) {
                    chat.isMuted = isMuted;
                }
            })
            
            // Search messages
            .addCase(searchMessages.fulfilled, (state, action) => {
                const { chatId, results } = action.payload;
                state.searchResults[chatId] = results;
            });
    }
});

export const {
    setActiveChat,
    addNewMessage,
    updateUnreadCount,
    setTypingUser,
    setUserOnline,
    setUserOffline,
    resetChatState,
    setReplyingTo,
    setEditingMessage,
    updateUploadProgress,
    addUploadingFile,
    removeUploadingFile,
    updateMessageInState,
    removeMessageFromState
} = chatSlice.actions;

export default chatSlice.reducer;