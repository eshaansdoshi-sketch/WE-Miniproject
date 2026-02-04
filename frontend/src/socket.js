const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

class SocketService {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.listeners = [];
    }

    connect(userId) {
        if (this.socket && this.userId === userId && this.socket.readyState === WebSocket.OPEN) {
            console.log('Socket already connected');
            return;
        }

        this.userId = userId;
        this.socket = new WebSocket(`${WS_URL}/${userId}`);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WS Message:', data);
                // Dispatch to listeners
                this.listeners.forEach(callback => callback(data));
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');
            // Simple reconnect logic could go here
        };

        this.socket.onerror = (err) => {
            console.error('WebSocket Error:', err);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.userId = null;
        }
    }

    // Subscribe to messages
    subscribe(callback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}

export const socketService = new SocketService();
