import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import cookie from 'cookie';

const userSocketMap = new Map(); // userId -> socketId

export const initializeSocketIO = (server) => {
    // Environment-based CORS origins
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [
            "https://synapse-net.netlify.app",
            process.env.FRONTEND_URL
          ].filter(Boolean)
        : [
            "http://localhost:5173",
            "http://192.168.252.186:5173",
            "https://synapse-net.netlify.app"
          ];

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware using cookies (matching your verifyJWT pattern)
    io.use(async (socket, next) => {
        try {
            // Parse cookies from the handshake headers
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) {
                return next(new Error('Unauthorized request'));
            }

            const parsedCookies = cookie.parse(cookies);
            const token = parsedCookies.accessToken;

            if (!token) {
                return next(new Error('Unauthorized request'));
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

            if (!user) {
                return next(new Error('Invalid Access Token'));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            next();
        } catch (error) {
            next(new Error(error?.message || 'Invalid access token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('User connected:', socket.userId, 'Socket ID:', socket.id);
        
        // Store user socket mapping
        userSocketMap.set(socket.userId, socket.id);
        
        // Join user to their personal room
        socket.join(`user_${socket.userId}`);
        
        // Update user online status
        try {
            await User.findByIdAndUpdate(socket.userId, {
                isOnline: true,
                lastActive: new Date()
            });
        } catch (error) {
            console.error('Error updating user online status:', error);
        }

        // Join user to all their chat rooms
        try {
            const userChats = await Chat.find({ 
                participants: socket.userId,
                isActive: true 
            });
            
            userChats.forEach(chat => {
                socket.join(`chat_${chat._id}`);
                console.log(`User ${socket.userId} joined chat room: chat_${chat._id}`);
            });

            // Emit online status to all contacts
            const contactIds = new Set();
            userChats.forEach(chat => {
                chat.participants.forEach(participant => {
                    if (participant.toString() !== socket.userId) {
                        contactIds.add(participant.toString());
                    }
                });
            });

            contactIds.forEach(contactId => {
                io.to(`user_${contactId}`).emit('userOnline', socket.userId);
            });
        } catch (error) {
            console.error('Error joining chat rooms:', error);
        }

        // Handle typing indicator
        socket.on('typing', async ({ chatId, isTyping }) => {
            try {
                // Verify user is participant of the chat
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: socket.userId
                });

                if (chat) {
                    socket.to(`chat_${chatId}`).emit('userTyping', {
                        userId: socket.userId,
                        username: socket.user.username,
                        chatId,
                        isTyping
                    });
                }
            } catch (error) {
                console.error('Error handling typing indicator:', error);
            }
        });

        // Handle message seen/read receipts
        socket.on('messageSeen', async ({ chatId, messageId }) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    chatId: chatId
                });

                if (message && !message.readBy.some(r => r.userId.toString() === socket.userId)) {
                    message.readBy.push({ userId: socket.userId, readAt: new Date() });
                    message.status = 'read';
                    await message.save();

                    // Notify sender that message was read
                    io.to(`user_${message.sender}`).emit('messageRead', {
                        messageId,
                        userId: socket.userId,
                        username: socket.user.username,
                        chatId
                    });
                }
            } catch (error) {
                console.error('Error marking message as seen:', error);
            }
        });

        // Handle joining a new chat (when a new chat is created)
        socket.on('joinChat', async (chatId) => {
            try {
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: socket.userId
                });

                if (chat) {
                    socket.join(`chat_${chatId}`);
                    console.log(`User ${socket.userId} joined new chat: chat_${chatId}`);
                }
            } catch (error) {
                console.error('Error joining chat:', error);
            }
        });

        // Handle message delivery status
        socket.on('messageDelivered', async ({ messageId, chatId }) => {
            try {
                const message = await Message.findById(messageId);
                if (message && !message.deliveredTo.some(d => d.userId.toString() === socket.userId)) {
                    message.deliveredTo.push({ 
                        userId: socket.userId, 
                        deliveredAt: new Date() 
                    });
                    message.status = 'delivered';
                    await message.save();

                    // Notify sender
                    io.to(`user_${message.sender}`).emit('messageDeliveryUpdate', {
                        messageId,
                        userId: socket.userId,
                        status: 'delivered'
                    });
                }
            } catch (error) {
                console.error('Error updating message delivery status:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.userId);
            
            userSocketMap.delete(socket.userId);
            
            // Update user offline status
            try {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastActive: new Date()
                });

                // Get user's chats to notify contacts
                const userChats = await Chat.find({ 
                    participants: socket.userId 
                });

                const contactIds = new Set();
                userChats.forEach(chat => {
                    chat.participants.forEach(participant => {
                        if (participant.toString() !== socket.userId) {
                            contactIds.add(participant.toString());
                        }
                    });
                });

                // Emit offline status to all contacts
                contactIds.forEach(contactId => {
                    io.to(`user_${contactId}`).emit('userOffline', socket.userId);
                });
            } catch (error) {
                console.error('Error updating user offline status:', error);
            }
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error for user', socket.userId, ':', error);
        });
    });

    return io;
};

// Helper function to get socket ID by user ID
export const getSocketId = (userId) => {
    return userSocketMap.get(userId.toString());
};

// Helper function to emit to specific user
export const emitToUser = (io, userId, event, data) => {
    const socketId = getSocketId(userId);
    if (socketId) {
        io.to(socketId).emit(event, data);
    } else {
        // User might be offline, you could queue the message
        console.log(`User ${userId} is not connected`);
    }
};

// Helper function to emit to chat room
export const emitToChat = (io, chatId, event, data, excludeUserId = null) => {
    if (excludeUserId) {
        // Emit to all in chat except one user
        const socketId = getSocketId(excludeUserId);
        if (socketId) {
            io.to(`chat_${chatId}`).except(socketId).emit(event, data);
        } else {
            io.to(`chat_${chatId}`).emit(event, data);
        }
    } else {
        io.to(`chat_${chatId}`).emit(event, data);
    }
};

// Helper function to check if user is online
export const isUserOnline = (userId) => {
    return userSocketMap.has(userId.toString());
};

// Export the map for debugging purposes
export const getOnlineUsers = () => {
    return Array.from(userSocketMap.keys());
};