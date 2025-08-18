const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

// Load environment variables
require('dotenv').config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
  console.log('Warning: JWT_SECRET not found in environment, using default value');
}

// Set default MONGODB_URI if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/campus-connect';
  console.log('Warning: MONGODB_URI not found in environment, using default value');
}

// Log environment configuration
console.log('Environment configuration:');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set (using default)');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set (using default)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Connect API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import and use routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/test', require('./src/routes/test')); // Test routes for role-based access
app.use('/api/chat', require('./src/routes/chat')); // Chat routes
app.use('/api/announcements', require('./src/routes/announcements')); // Announcement routes
app.use('/api/admin', require('./src/routes/admin')); // Admin routes
// TODO: Add other route files here
// app.use('/api/users', require('./src/routes/users'));
app.use('/api/tickets', require('./src/routes/tickets'));
app.use('/api/appointments', require('./src/routes/appointments')); // Appointment routes

// Initialize Socket.IO
const { initializeSocket } = require('./src/socket/chatSocket');
initializeSocket(io);

// Global error handling middleware
const { globalErrorHandler } = require('./src/utils/errorHandler');
app.use(globalErrorHandler);

// 404 handler - this should be the last middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('Starting server...');
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Socket.IO server initialized`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
