// src/services/aiChatService.js
import { v4 as uuidv4 } from 'uuid';
import { axiosPrivate } from '../utils/api';

class AIChatService {
    constructor() {
        this.AI_CHAT_ID = '000000000000000000000001'; // Valid ObjectId format
        this.AI_BOT_ID = '000000000000000000000002';
        this.AI_BOT_INFO = {
            _id: this.AI_BOT_ID,
            username: 'AI Assistant',
            profilePicture: '/ai-avatar.png', // Add your AI avatar
            isBot: true,
            isOnline: true
        };
    }

    createAIChatObject() {
        return {
            _id: this.AI_CHAT_ID,
            participants: [this.AI_BOT_INFO],
            chatType: 'ai',
            isAIChat: true,
            lastMessage: {
                _id: uuidv4(),
                content: "Hi! I'm your AI assistant powered by Gemini. How can I help you today?",
                createdAt: new Date().toISOString(),
                sender: this.AI_BOT_ID,
                messageType: 'text'
            },
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async generateAIResponse(message, conversationHistory = []) {
        try {
            const response = await axiosPrivate.post('/api/v1/ai/chat', {
                message,
                history: conversationHistory.map(msg => ({
                    content: msg.content,
                    isAIMessage: msg.sender._id === this.AI_BOT_ID || msg.sender === this.AI_BOT_ID
                }))
            });

            return response.data.data.response;
        } catch (error) {
            console.error('AI Error:', error);
            
            // Handle specific error cases
            if (error.response?.status === 429) {
                return "I'm currently experiencing high demand. Please try again in a moment.";
            } else if (error.response?.status === 401) {
                return "I'm having trouble authenticating. Please refresh and try again.";
            }
            
            return "I apologize, but I'm having trouble processing your request right now. Please try again.";
        }
    }

    createAIMessage(content, sender = this.AI_BOT_ID, status = 'sent') {
        const isUserMessage = sender !== this.AI_BOT_ID;
        
        return {
            _id: uuidv4(),
            chatId: this.AI_CHAT_ID,
            sender: isUserMessage ? sender : this.AI_BOT_INFO,
            content,
            messageType: 'text',
            createdAt: new Date().toISOString(),
            readBy: isUserMessage ? [] : [{ userId: sender, readAt: new Date() }],
            status,
            isAIMessage: !isUserMessage,
            isEncrypted: false,
            isDeleted: false
        };
    }

    // Store AI conversations in localStorage with size limit
    saveAIConversation(messages) {
        try {
            // Keep only last 100 messages to avoid localStorage limits
            const messagesToSave = messages.slice(-100);
            localStorage.setItem('ai-chat-messages', JSON.stringify(messagesToSave));
        } catch (error) {
            console.error('Failed to save AI conversation:', error);
            // Clear old messages if storage is full
            localStorage.removeItem('ai-chat-messages');
        }
    }

    loadAIConversation() {
        try {
            const saved = localStorage.getItem('ai-chat-messages');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load AI conversation:', error);
            return [];
        }
    }

    clearAIConversation() {
        localStorage.removeItem('ai-chat-messages');
    }

    // Check if a chat is an AI chat
    isAIChat(chatId) {
        return chatId === this.AI_CHAT_ID;
    }

    // Format message for display (matching your existing message structure)
    formatMessageForDisplay(message) {
        return {
            ...message,
            sender: typeof message.sender === 'string' 
                ? (message.sender === this.AI_BOT_ID ? this.AI_BOT_INFO : { _id: message.sender })
                : message.sender
        };
    }
}

export default new AIChatService();