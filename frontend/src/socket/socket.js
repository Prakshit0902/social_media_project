import { io } from 'socket.io-client';
import { store } from '../store/store';

class SocketService {
    constructor() {
        this.socket = null;
    }

connect() {
    const state = store.getState();
    const user = state.auth.user;

    if (!user || !state.auth.isAuthenticated) {
        console.error('No authenticated user for socket connection');
        return;
    }

    // Environment-based Socket URL
    const SOCKET_URL = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '')  // Remove /api if present
        : 'http://localhost:3000';
    
    console.log('Connecting to socket:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    this.setupListeners();
}

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            // Attempt to reconnect if it wasn't a manual disconnect
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            
            // If authentication fails, the error message will indicate it
            if (error.message.includes('Unauthorized') || error.message.includes('Invalid')) {
                console.error('Socket authentication failed');
                // You might want to redirect to login or refresh the token
            }
        });

        // Listen for new chats created
        this.socket.on('newChatCreated', ({ chatId }) => {
            this.socket.emit('joinChat', chatId);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected() {
        return this.socket && this.socket.connected;
    }

    // Utility method to reconnect
    reconnect() {
        if (!this.isConnected()) {
            this.connect();
        }
    }

    // Get socket id
    getSocketId() {
        return this.socket?.id;
    }
}

export default new SocketService();