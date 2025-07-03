import { encryptMessage, decryptMessage } from '../middlewares/encryption.middleware.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Create or get existing private chat

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

export const createGroupChat = asyncHandler(async (req, res) => {
    const { groupName, participantIds } = req.body;
    const userId = req.user._id;

    if (!groupName || !participantIds || participantIds.length < 2) {
        throw new ApiError(400, "Group name and at least 2 participants are required");
    }

    // Validate all participant IDs exist
    const validParticipants = await User.find({
        _id: { $in: participantIds }
    }).select('_id');

    if (validParticipants.length !== participantIds.length) {
        throw new ApiError(400, "Some participants are invalid");
    }

    // Add creator to participants if not already included
    const allParticipants = [...new Set([userId.toString(), ...participantIds])];
    
    const chat = await Chat.create({
        chatType: 'group',
        groupName,
        participants: allParticipants,
        groupAdmin: userId,
        unreadCounts: allParticipants.map(p => ({ user: p, count: 0 }))
    });

    await chat.populate('participants', 'username profilePicture');

    // Send socket notification to all participants
    const io = req.app.get('io');
    if (io) {
        // Notify all participants about the new group
        allParticipants.forEach(participantId => {
            io.to(`user_${participantId}`).emit('newChatCreated', {
                chat
            });
        });
    }

    // Create initial system message
    await Message.create({
        chatId: chat._id,
        sender: userId,
        messageType: 'text',
        content: `${req.user.username} created the group "${groupName}"`,
        isEncrypted: false,
        readBy: [{ userId, readAt: new Date() }]
    });

    return res.status(201).json(
        new ApiResponse(201, chat, "Group created successfully")
    );
});

// Update sendMessage with encryption
export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, content, messageType = 'text', replyTo } = req.body;
    const userId = req.user._id;

    if (!chatId || !content) {
        throw new ApiError(400, "Chat ID and content are required");
    }

    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    // Encrypt text messages only
    let messageData = {
        chatId,
        sender: userId,
        messageType,
        readBy: [{ userId, readAt: new Date() }]
    };

    if (messageType === 'text') {
        const { content: encryptedContent, iv, authTag } = encryptMessage(content);
        messageData.content = encryptedContent;
        messageData.encryptionIV = iv;
        messageData.encryptionAuthTag = authTag;
        messageData.isEncrypted = true;
    } else {
        messageData.content = content;
        messageData.isEncrypted = false;
    }

    if (replyTo) {
        messageData.replyTo = replyTo;
    }

    const message = await Message.create(messageData);

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    
    chat.unreadCounts.forEach(uc => {
        if (uc.user.toString() !== userId.toString()) {
            uc.count += 1;
        }
    });
    
    await chat.save();

    // Populate and decrypt for response
    await message.populate([
        { path: 'sender', select: 'username profilePicture' },
        { path: 'replyTo', select: 'content sender messageType' }
    ]);

    const responseMessage = message.toObject();
    if (message.isEncrypted && message.encryptionIV && message.encryptionAuthTag) {
        responseMessage.content = decryptMessage(
            message.content, 
            message.encryptionIV, 
            message.encryptionAuthTag
        );
    }

    // Decrypt reply message if exists
    if (responseMessage.replyTo && responseMessage.replyTo.isEncrypted) {
        responseMessage.replyTo.content = decryptMessage(
            responseMessage.replyTo.content,
            responseMessage.replyTo.encryptionIV,
            responseMessage.replyTo.encryptionAuthTag
        );
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
        chat.participants.forEach(participantId => {
            if (participantId.toString() !== userId.toString()) {
                io.to(`user_${participantId}`).emit('newMessage', {
                    message: responseMessage,
                    chatId
                });
            }
        });
    }

    return res.status(201).json(
        new ApiResponse(201, responseMessage, "Message sent successfully")
    );
});

// Update getChatMessages with decryption
export const getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

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
    .populate('replyTo', 'content sender messageType encryptionIV encryptionAuthTag isEncrypted')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Decrypt messages
    const decryptedMessages = messages.map(msg => {
        const msgObj = msg.toObject();
        
        // Decrypt main message
        if (msg.isEncrypted && msg.encryptionIV && msg.encryptionAuthTag) {
            msgObj.content = decryptMessage(
                msg.content, 
                msg.encryptionIV, 
                msg.encryptionAuthTag
            );
        }
        
        // Decrypt reply if exists
        if (msgObj.replyTo && msgObj.replyTo.isEncrypted) {
            msgObj.replyTo.content = decryptMessage(
                msgObj.replyTo.content,
                msgObj.replyTo.encryptionIV,
                msgObj.replyTo.encryptionAuthTag
            );
        }

        // Handle deleted messages
        if (msg.isDeleted) {
            msgObj.content = "This message was deleted";
            msgObj.messageType = 'text';
        }

        return msgObj;
    });

    // Mark as read
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
        new ApiResponse(200, decryptedMessages.reverse(), "Messages fetched successfully")
    );
});

// Upload media message
export const uploadMediaMessage = asyncHandler(async (req, res) => {
    const { chatId, replyTo } = req.body;
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
        throw new ApiError(400, "No file uploaded");
    }

    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    // Upload to cloudinary
    const uploadResult = await uploadOnCloudinary(file.path);
    
    if (!uploadResult) {
        throw new ApiError(500, "Failed to upload file");
    }

    // Determine message type
    let messageType = 'file';
    if (file.mimetype.startsWith('image/')) {
        messageType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
        messageType = 'video';
    }

    const messageData = {
        chatId,
        sender: userId,
        messageType,
        content: uploadResult.secure_url,
        mediaInfo: {
            fileName: file.originalname,
            fileSize: file.size,
            thumbnail: uploadResult.thumbnail_url || uploadResult.secure_url
        },
        readBy: [{ userId, readAt: new Date() }],
        isEncrypted: false
    };

    if (replyTo) {
        messageData.replyTo = replyTo;
    }

    const message = await Message.create(messageData);

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    
    chat.unreadCounts.forEach(uc => {
        if (uc.user.toString() !== userId.toString()) {
            uc.count += 1;
        }
    });
    
    await chat.save();

    await message.populate([
        { path: 'sender', select: 'username profilePicture' },
        { path: 'replyTo', select: 'content sender messageType' }
    ]);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
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
        new ApiResponse(201, message, "Media uploaded successfully")
    );
});

// Update deleteMessage to show "deleted" instead of removing
export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { deleteForAll = false } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (deleteForAll) {
        // Only message sender can delete for all
        if (message.sender.toString() !== userId.toString()) {
            throw new ApiError(403, "You can only delete your own messages for everyone");
        }
        
        message.isDeleted = true;
        message.content = "";
        await message.save();

        // Emit to all participants
        const io = req.app.get('io');
        if (io) {
            io.to(`chat_${message.chatId}`).emit('messageDeleted', {
                messageId,
                chatId: message.chatId,
                deletedForAll: true
            });
        }
    } else {
        // Delete only for current user
        if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
            await message.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Message deleted successfully")
    );
});

// Edit message
export const editMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (message.sender.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only edit your own messages");
    }

    if (message.messageType !== 'text') {
        throw new ApiError(400, "Only text messages can be edited");
    }

    // Encrypt new content
    const { content: encryptedContent, iv, authTag } = encryptMessage(content);
    
    message.content = encryptedContent;
    message.encryptionIV = iv;
    message.encryptionAuthTag = authTag;
    message.isEdited = true;
    message.editedAt = new Date();
    
    await message.save();
    await message.populate('sender', 'username profilePicture');

    const responseMessage = message.toObject();
    responseMessage.content = content;

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
        io.to(`chat_${message.chatId}`).emit('messageEdited', {
            message: responseMessage,
            chatId: message.chatId
        });
    }

    return res.status(200).json(
        new ApiResponse(200, responseMessage, "Message edited successfully")
    );
});

// Mute/Unmute chat
export const toggleMuteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    const isMuted = chat.mutedBy.includes(userId);
    
    if (isMuted) {
        chat.mutedBy = chat.mutedBy.filter(id => id.toString() !== userId.toString());
            } else {
        chat.mutedBy.push(userId);
    }
    
    await chat.save();

    return res.status(200).json(
        new ApiResponse(200, { isMuted: !isMuted }, `Chat ${!isMuted ? 'muted' : 'unmuted'} successfully`)
    );
});

// Search messages in chat
export const searchMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
        throw new ApiError(400, "Search query is required");
    }

    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    // Find all text messages
    const messages = await Message.find({
        chatId,
        messageType: 'text',
        deletedFor: { $ne: userId },
        isDeleted: false
    })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: -1 });

    // Decrypt and search
    const searchResults = [];
    messages.forEach(msg => {
        if (msg.isEncrypted && msg.encryptionIV && msg.encryptionAuthTag) {
            const decryptedContent = decryptMessage(
                msg.content,
                msg.encryptionIV,
                msg.encryptionAuthTag
            );
            
            if (decryptedContent.toLowerCase().includes(query.toLowerCase())) {
                const msgObj = msg.toObject();
                msgObj.content = decryptedContent;
                searchResults.push(msgObj);
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, searchResults, "Search completed")
    );
});

// Leave group chat
export const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
        _id: chatId,
        chatType: 'group',
        participants: userId
    });

    if (!chat) {
        throw new ApiError(404, "Group chat not found");
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(p => p.toString() !== userId.toString());
    
    // If user was admin, assign new admin
    if (chat.groupAdmin?.toString() === userId.toString() && chat.participants.length > 0) {
        chat.groupAdmin = chat.participants[0];
    }

    // Remove from unread counts
    chat.unreadCounts = chat.unreadCounts.filter(uc => uc.user.toString() !== userId.toString());

    await chat.save();

    // Create system message
    await Message.create({
        chatId,
        sender: userId,
        messageType: 'text',
        content: `${req.user.username} left the group`,
        isEncrypted: false
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Left group successfully")
    );
});