const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Quote = require('../Models/Quote');

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedClients = new Map();
        this.roomSubscriptions = new Map();
    }

    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.setupMiddleware();
        this.setupEventHandlers();
        
        console.log('WebSocket server initialized');
        return this.io;
    }

    /**
     * Setup authentication middleware
     */
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                
                if (!token) {
                    // Allow anonymous connections for public quote viewing
                    socket.user = { id: 'anonymous', role: 'guest' };
                    return next();
                }

                // Verify JWT token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                
                next();
            } catch (error) {
                console.error('WebSocket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}, User: ${socket.user.id}`);
            
            // Store client connection
            this.connectedClients.set(socket.id, {
                socket,
                user: socket.user,
                connectedAt: new Date(),
                rooms: new Set()
            });

            // Handle client events
            this.handleClientEvents(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
        });
    }

    /**
     * Handle individual client events
     */
    handleClientEvents(socket) {
        // Join quote-specific room for real-time updates
        socket.on('joinQuoteRoom', (quoteId) => {
            this.joinQuoteRoom(socket, quoteId);
        });

        // Leave quote room
        socket.on('leaveQuoteRoom', (quoteId) => {
            this.leaveQuoteRoom(socket, quoteId);
        });

        // Subscribe to all quotes updates (admin/staff only)
        socket.on('subscribeToQuotes', () => {
            if (socket.user.role === 'admin' || socket.user.role === 'staff') {
                socket.join('allQuotes');
                this.connectedClients.get(socket.id).rooms.add('allQuotes');
                socket.emit('subscriptionConfirmed', { room: 'allQuotes' });
            } else {
                socket.emit('subscriptionDenied', { reason: 'Insufficient permissions' });
            }
        });

        // Request quote statistics
        socket.on('requestQuoteStats', async () => {
            if (socket.user.role === 'admin' || socket.user.role === 'staff') {
                try {
                    const stats = await Quote.getQuoteStats();
                    const expiring = await Quote.findExpiring(7);
                    
                    socket.emit('quoteStats', {
                        statusStats: stats,
                        expiringCount: expiring.length,
                        timestamp: new Date()
                    });
                } catch (error) {
                    socket.emit('error', { message: 'Failed to fetch quote statistics' });
                }
            }
        });

        // Handle quote view tracking
        socket.on('viewQuote', async (data) => {
            const { quoteId } = data;
            try {
                const quote = await Quote.findById(quoteId);
                if (quote) {
                    await quote.markAsViewed(
                        socket.handshake.address,
                        socket.handshake.headers['user-agent']
                    );
                    
                    // Broadcast to quote room and admin room
                    this.io.to(`quote_${quoteId}`).emit('quoteViewed', {
                        quoteId,
                        viewedAt: quote.clientViewed.viewedAt,
                        quoteNumber: quote.quoteNumber
                    });
                    
                    this.io.to('allQuotes').emit('quoteUpdate', {
                        quoteId,
                        eventType: 'viewed',
                        timestamp: new Date(),
                        data: {
                            quoteNumber: quote.quoteNumber,
                            viewedAt: quote.clientViewed.viewedAt
                        }
                    });
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to track quote view' });
            }
        });

        // Handle typing indicators for quote comments/notes
        socket.on('typing', (data) => {
            const { quoteId, isTyping } = data;
            socket.to(`quote_${quoteId}`).emit('userTyping', {
                userId: socket.user.id,
                userName: socket.user.name,
                isTyping,
                timestamp: new Date()
            });
        });

        // Handle quote comments in real-time
        socket.on('addQuoteComment', async (data) => {
            const { quoteId, comment } = data;
            try {
                // In a real app, you'd save this to a comments collection
                const commentData = {
                    id: Date.now().toString(),
                    quoteId,
                    userId: socket.user.id,
                    userName: socket.user.name,
                    comment,
                    timestamp: new Date()
                };

                // Broadcast to all clients in the quote room
                this.io.to(`quote_${quoteId}`).emit('newQuoteComment', commentData);
            } catch (error) {
                socket.emit('error', { message: 'Failed to add comment' });
            }
        });

        // Handle client heartbeat
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date() });
        });

        // Handle quote status changes in real-time
        socket.on('updateQuoteStatus', async (data) => {
            const { quoteId, status, notes } = data;
            
            // Only allow admin/staff to update status
            if (socket.user.role !== 'admin' && socket.user.role !== 'staff') {
                socket.emit('error', { message: 'Insufficient permissions to update quote status' });
                return;
            }

            try {
                const quote = await Quote.findById(quoteId);
                if (quote) {
                    const oldStatus = quote.status;
                    quote.status = status;
                    if (notes) quote.notes = notes;
                    quote.updatedBy = socket.user.id;
                    quote.updatedAt = new Date();
                    
                    await quote.save();

                    // Broadcast status update to all relevant clients
                    const updateData = {
                        quoteId,
                        eventType: 'statusChange',
                        oldStatus,
                        newStatus: status,
                        updatedBy: socket.user.name,
                        timestamp: new Date(),
                        data: {
                            quoteNumber: quote.quoteNumber,
                            status,
                            notes
                        }
                    };

                    // Notify quote room and admin room
                    this.io.to(`quote_${quoteId}`).emit('quoteStatusChanged', updateData);
                    this.io.to('allQuotes').emit('quoteUpdate', updateData);
                    
                    socket.emit('statusUpdateSuccess', { quoteId, status });
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to update quote status' });
            }
        });

        // Handle real-time notifications
        socket.on('markNotificationRead', async (data) => {
            const { notificationId } = data;
            try {
                // Update notification status in database
                // This would depend on your notification model
                socket.emit('notificationMarked', { notificationId, read: true });
            } catch (error) {
                socket.emit('error', { message: 'Failed to mark notification as read' });
            }
        });
    }

    /**
     * Join quote-specific room
     */
    joinQuoteRoom(socket, quoteId) {
        const roomName = `quote_${quoteId}`;
        socket.join(roomName);
        this.connectedClients.get(socket.id).rooms.add(roomName);
        
        // Track room subscriptions
        if (!this.roomSubscriptions.has(roomName)) {
            this.roomSubscriptions.set(roomName, new Set());
        }
        this.roomSubscriptions.get(roomName).add(socket.id);

        socket.emit('joinedRoom', { room: roomName, quoteId });
        
        // Notify other clients in the room about new participant
        socket.to(roomName).emit('userJoinedRoom', {
            userId: socket.user.id,
            userName: socket.user.name,
            timestamp: new Date()
        });

        console.log(`Client ${socket.id} joined room ${roomName}`);
    }

    /**
     * Leave quote-specific room
     */
    leaveQuoteRoom(socket, quoteId) {
        const roomName = `quote_${quoteId}`;
        socket.leave(roomName);
        
        const clientData = this.connectedClients.get(socket.id);
        if (clientData) {
            clientData.rooms.delete(roomName);
        }

        // Remove from room subscriptions
        if (this.roomSubscriptions.has(roomName)) {
            this.roomSubscriptions.get(roomName).delete(socket.id);
            if (this.roomSubscriptions.get(roomName).size === 0) {
                this.roomSubscriptions.delete(roomName);
            }
        }

        socket.emit('leftRoom', { room: roomName, quoteId });
        
        // Notify other clients in the room about user leaving
        socket.to(roomName).emit('userLeftRoom', {
            userId: socket.user.id,
            userName: socket.user.name,
            timestamp: new Date()
        });

        console.log(`Client ${socket.id} left room ${roomName}`);
    }

    /**
     * Handle client disconnection
     */
    handleDisconnection(socket) {
        console.log(`Client disconnected: ${socket.id}`);
        
        const clientData = this.connectedClients.get(socket.id);
        if (clientData) {
            // Notify all rooms this client was in about the disconnection
            clientData.rooms.forEach(roomName => {
                socket.to(roomName).emit('userDisconnected', {
                    userId: socket.user.id,
                    userName: socket.user.name,
                    timestamp: new Date()
                });

                // Clean up room subscriptions
                if (this.roomSubscriptions.has(roomName)) {
                    this.roomSubscriptions.get(roomName).delete(socket.id);
                    if (this.roomSubscriptions.get(roomName).size === 0) {
                        this.roomSubscriptions.delete(roomName);
                    }
                }
            });

            // Remove client from connected clients map
            this.connectedClients.delete(socket.id);
        }
    }

    /**
     * Broadcast to all clients in a specific quote room
     */
    broadcastToQuoteRoom(quoteId, event, data) {
        if (this.io) {
            this.io.to(`quote_${quoteId}`).emit(event, data);
        }
    }

    /**
     * Broadcast to all admin/staff clients
     */
    broadcastToAdmins(event, data) {
        if (this.io) {
            this.io.to('allQuotes').emit(event, data);
        }
    }

    /**
     * Send notification to specific user
     */
    sendNotificationToUser(userId, notification) {
        if (this.io) {
            // Find all sockets for this user
            const userSockets = Array.from(this.connectedClients.values())
                .filter(client => client.user.id === userId)
                .map(client => client.socket);

            userSockets.forEach(socket => {
                socket.emit('notification', notification);
            });
        }
    }

    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }

    /**
     * Get room statistics
     */
    getRoomStats() {
        const stats = {
            totalClients: this.connectedClients.size,
            totalRooms: this.roomSubscriptions.size,
            rooms: {}
        };

        this.roomSubscriptions.forEach((clients, roomName) => {
            stats.rooms[roomName] = clients.size;
        });

        return stats;
    }

    /**
     * Broadcast system maintenance message
     */
    broadcastMaintenanceMessage(message, scheduledTime) {
        if (this.io) {
            this.io.emit('maintenanceNotice', {
                message,
                scheduledTime,
                timestamp: new Date()
            });
        }
    }

    /**
     * Gracefully close all connections
     */
    async shutdown() {
        if (this.io) {
            console.log('Shutting down WebSocket server...');
            
            // Notify all clients about server shutdown
            this.io.emit('serverShutdown', {
                message: 'Server is shutting down for maintenance',
                timestamp: new Date()
            });

            // Give clients time to receive the message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Close all connections
            this.io.close();
            this.connectedClients.clear();
            this.roomSubscriptions.clear();
            
            console.log('WebSocket server shutdown complete');
        }
    }

    /**
     * Health check for WebSocket service
     */
    healthCheck() {
        return {
            status: 'healthy',
            connectedClients: this.connectedClients.size,
            activeRooms: this.roomSubscriptions.size,
            uptime: process.uptime(),
            timestamp: new Date()
        };
    }
}

module.exports = new WebSocketService();