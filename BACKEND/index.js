const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

// Load environment variables
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.log('Please create a .env file with the following variables:');
  console.log('MONGODB_URI=mongodb://localhost:27017/campus-connect');
  process.exit(1);
}

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
// TODO: Add other route files here
// app.use('/api/users', require('./src/routes/users'));
// app.use('/api/tickets', require('./src/routes/tickets'));

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
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server initialized`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
