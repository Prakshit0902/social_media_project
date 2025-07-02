import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";

// Get all chats for the logged-in user
export const getUserChats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const chats = await Chat.find({
        participants: userId,
        isActive: true
    })
    .populate('participants', 'username profilePicture')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    // Update unread counts for current user
    const chatsWithUnread = chats.map(chat => {
        const chatObj = chat.toObject();
        const unreadEntry = chatObj.unreadCounts.find(
            uc => uc.user.toString() === userId.toString()
        );
        chatObj.unreadCount = unreadEntry?.count || 0;
        return chatObj;
    });

    return res.status(200).json(
        new ApiResponse(200, chatsWithUnread, "Chats fetched successfully")
    );
});

// Create or get existing private chat
export const createOrGetPrivateChat = asyncHandler(async (req, res) => {
    const { participantId } = req.body;
    const userId = req.user._id;

    if (!participantId) {
        throw new ApiError(400, "Participant ID is required");
    }

    if (participantId === userId.toString()) {
        throw new ApiError(400, "Cannot create chat with yourself");
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
        chatType: 'private',
        participants: { $all: [userId, participantId] }
    });

    if (chat) {
        await chat.populate('participants', 'username profilePicture');
        return res.status(200).json(
            new ApiResponse(200, chat, "Chat fetched successfully")
        );
    }

    // Create new chat
    chat = await Chat.create({
        chatType: 'private',
        participants: [userId, participantId],
        unreadCounts: [
            { user: userId, count: 0 },
            { user: participantId, count: 0 }
        ]
    });

    await chat.populate('participants', 'username profilePicture');

    const io = req.app.get('io');
    if (io) {
        // Notify all participants to join the new chat room
        chat.participants.forEach(participantId => {
            io.to(`user_${participantId}`).emit('newChatCreated', {
                chatId: chat._id
            });
        });
    }

    return res.status(201).json(
        new ApiResponse(201, chat, "Chat created successfully")
    );
});

// Create group chat
export const createGroupChat = asyncHandler(async (req, res) => {
    const { groupName, participantIds } = req.body;
    const userId = req.user._id;

    if (!groupName || !participantIds || participantIds.length < 2) {
        throw new ApiError(400, "Group name and at least 2 participants are required");
    }

    // Add creator to participants
    const allParticipants = [userId, ...participantIds];
    
    const chat = await Chat.create({
        chatType: 'group',
        groupName,
        participants: allParticipants,
        groupAdmin: userId,
        unreadCounts: allParticipants.map(p => ({ user: p, count: 0 }))
    });

    await chat.populate('participants', 'username profilePicture');

    return res.status(201).json(
        new ApiResponse(201, chat, "Group created successfully")
    );
});

// Get chat messages
export const getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify user is participant
    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    const messages = await Message.find({
        chatId,
        deletedFor: { $ne: userId }
    })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const io = req.app.get('io');
    if (io) {
        // Notify all participants to join the new chat room
        chat.participants.forEach(participantId => {
            io.to(`user_${participantId}`).emit('newChatCreated', {
                chatId: chat._id
            });
        });
    }

    // Mark messages as read
    await Message.updateMany(
        {
            chatId,
            sender: { $ne: userId },
            'readBy.userId': { $ne: userId }
        },
        {
            $push: { readBy: { userId, readAt: new Date() } },
            $set: { status: 'read' }
        }
    );

    // Reset unread count for current user
    await Chat.updateOne(
        { _id: chatId, 'unreadCounts.user': userId },
        { $set: { 'unreadCounts.$.count': 0 } }
    );

    return res.status(200).json(
        new ApiResponse(200, messages.reverse(), "Messages fetched successfully")
    );
});

// Send message
export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, content, messageType = 'text' } = req.body;
    const userId = req.user._id;

    if (!chatId || !content) {
        throw new ApiError(400, "Chat ID and content are required");
    }

    // Verify user is participant
    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    const message = await Message.create({
        chatId,
        sender: userId,
        messageType,
        content,
        readBy: [{ userId, readAt: new Date() }]
    });

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    
    // Increment unread count for other participants
    chat.unreadCounts.forEach(uc => {
        if (uc.user.toString() !== userId.toString()) {
            uc.count += 1;
        }
    });
    
    await chat.save();

    await message.populate('sender', 'username profilePicture');

    // Emit socket event (will be handled in socket controller)
    const io = req.app.get('io');
    if (io) {
        // Emit to all participants except sender
        chat.participants.forEach(participantId => {
            if (participantId.toString() !== userId.toString()) {
                io.to(`user_${participantId}`).emit('newMessage', {
                    message,
                    chatId
                });
            }
        });
    }

    return res.status(201).json(
        new ApiResponse(201, message, "Message sent successfully")
    );
});

// Delete message
export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (message.sender.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own messages");
    }

    message.isDeleted = true;
    message.deletedFor.push(userId);
    await message.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Message deleted successfully")
    );
});

// Mark messages as read
export const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
        {
            chatId,
            sender: { $ne: userId },
            'readBy.userId': { $ne: userId }
        },
        {
            $push: { readBy: { userId, readAt: new Date() } },
            $set: { status: 'read' }
        }
    );

    await Chat.updateOne(
        { _id: chatId, 'unreadCounts.user': userId },
        { $set: { 'unreadCounts.$.count': 0 } }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Messages marked as read")
    );
});