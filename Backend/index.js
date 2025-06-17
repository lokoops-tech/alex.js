const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require("dotenv").config();

// Import WebSocket Service (assuming it's in a services folder)
const WebSocketService = require('../Backend/Server/Websocket');

// Import your existing routes here
//example const authUsersRoutes = require("./routes/authUsers");
//const QuoteRoutes = require('../Backend/Routes/Quote');
//const { router: QuoteRoutes } = require('../Backend/Routes/Quote');
const { router: BlogRoutes, setupWebSocket } = require('../Backend/Routes/Blog');
const { router: ProjectRoute } = require('../Backend/Routes/Project');
const AdminLoginRoutes = require('../Backend/Routes/AdminLogin');

//const QuoteModule = require('../Backend/Routes/Quote');

// Middleware functions will be added here when auth is implemented

const app = express();

// Create HTTP server for WebSocket integration
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration
// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean); // This removes any falsy values (like undefined FRONTEND_URL)

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (if you have any)
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
    // Setup database change streams for real-time updates
    setupChangeStreams();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Initialize WebSocket Service
WebSocketService.initialize(server);
console.log('WebSocket service initialized');

//Setup your API routes here;
//app.use('/quotes', QuoteRoutes);
app.use('/blog', BlogRoutes);
app.use('/projects', ProjectRoute);
app.use('/admin', AdminLoginRoutes); // Admin login and signup routes
//app.use("/stockUpdate", stockUpdateRoutes); // Stock-related routes

// WebSocket status endpoint
app.get('/api/websocket/status', (req, res) => {
    res.json(WebSocketService.healthCheck());
});

// WebSocket stats endpoint (TODO: add auth middleware when implemented)
app.get('/api/websocket/stats', (req, res) => {
    res.json(WebSocketService.getRoomStats());
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date(),
        websocket: WebSocketService.healthCheck()
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.json({
        message: 'API is running with WebSocket support',
        websocket: {
            status: 'active',
            connectedClients: WebSocketService.getConnectedClientsCount()
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    // WebSocket error notification for admins
    WebSocketService.broadcastToAdmins('systemError', {
        error: error.message,
        path: req.path,
        method: req.method,
        timestamp: new Date()
    });

    res.status(error.status || 500).json({
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Setup database change streams for real-time updates
function setupChangeStreams() {
    // Uncomment when you have your Quote model
    /*
    const Quote = require('./models/Quote');
    const quoteChangeStream = Quote.watch();
    
    quoteChangeStream.on('change', (change) => {
        handleQuoteChange(change);
    });
    */
    
    console.log('Database change streams setup ready');
}

// Handle database changes for real-time updates
function handleQuoteChange(change) {
    const { operationType, fullDocument, documentKey } = change;
    
    switch (operationType) {
        case 'insert':
            handleNewQuote(fullDocument);
            break;
        case 'update':
            handleQuoteUpdate(change);
            break;
        case 'delete':
            handleQuoteDelete(documentKey._id);
            break;
    }
}

function handleNewQuote(quote) {
    // Broadcast new quote to admins
    WebSocketService.broadcastToAdmins('newQuote', {
        eventType: 'created',
        quote: {
            id: quote._id,
            quoteNumber: quote.quoteNumber,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            projectTitle: quote.projectTitle,
            totalAmount: quote.totalAmount,
            status: quote.status,
            createdAt: quote.createdAt
        },
        timestamp: new Date()
    });
}

function handleQuoteUpdate(change) {
    const { fullDocument, updateDescription } = change;
    const updatedFields = updateDescription?.updatedFields || {};
    
    // Broadcast update to quote room
    WebSocketService.broadcastToQuoteRoom(fullDocument._id, 'quoteUpdated', {
        eventType: 'updated',
        quoteId: fullDocument._id,
        updatedFields,
        timestamp: new Date()
    });

    // Broadcast to admins
    WebSocketService.broadcastToAdmins('quoteUpdate', {
        eventType: 'updated',
        quoteId: fullDocument._id,
        quoteNumber: fullDocument.quoteNumber,
        updatedFields,
        timestamp: new Date()
    });
}

function handleQuoteDelete(quoteId) {
    // Broadcast deletion to admins
    WebSocketService.broadcastToAdmins('quoteDeleted', {
        eventType: 'deleted',
        quoteId,
        timestamp: new Date()
    });
}

// Setup periodic tasks
function setupPeriodicTasks() {
    // WebSocket stats logging every 5 minutes
    setInterval(() => {
        const stats = WebSocketService.getRoomStats();
        console.log(`WebSocket stats: ${stats.totalClients} clients, ${stats.totalRooms} rooms`);
    }, 5 * 60 * 1000);

    // Add more periodic tasks as needed
    // Example: Check for expiring quotes, send reminders, etc.
}

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    
    // Stop accepting new connections
    server.close(async () => {
        console.log('HTTP server closed');
        
        // Shutdown WebSocket service
        await WebSocketService.shutdown();
        
        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.log('Force shutting down...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
    
    // Setup periodic tasks
    setupPeriodicTasks();
});

module.exports = app;