const { io } = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your_test_jwt_token'; // Replace with actual token

// Create socket connection
const socket = io(SERVER_URL, {
  auth: {
    token: TEST_TOKEN
  }
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to chat server');
  
  // Test sending a message
  setTimeout(() => {
    console.log('📤 Sending test message...');
    socket.emit('send_message', {
      receiverId: 'test_receiver_id',
      content: 'Hello from test client!',
      messageType: 'text'
    });
  }, 1000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from chat server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Message events
socket.on('message_sent', (message) => {
  console.log('✅ Message sent successfully:', message);
});

socket.on('new_message', (message) => {
  console.log('📨 Received new message:', message);
});

socket.on('message_error', (error) => {
  console.error('❌ Message error:', error);
});

// Typing events
socket.on('user_typing', (data) => {
  console.log('⌨️ User typing:', data);
});

socket.on('user_stopped_typing', (data) => {
  console.log('⏹️ User stopped typing:', data);
});

// Conversation events
socket.on('conversation_updated', (data) => {
  console.log('🔄 Conversation updated:', data);
});

socket.on('messages_read', (data) => {
  console.log('👁️ Messages read:', data);
});

// Status events
socket.on('user_status_changed', (data) => {
  console.log('🟢 User status changed:', data);
});

// Test typing indicator
setTimeout(() => {
  console.log('⌨️ Testing typing indicator...');
  socket.emit('typing_start', { receiverId: 'test_receiver_id' });
  
  setTimeout(() => {
    socket.emit('typing_stop', { receiverId: 'test_receiver_id' });
  }, 2000);
}, 3000);

// Test status
setTimeout(() => {
  console.log('🟢 Testing status update...');
  socket.emit('set_status', { status: 'online' });
}, 5000);

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('🧹 Cleaning up...');
  socket.disconnect();
  process.exit(0);
}, 10000);

console.log('🚀 Starting chat system test...');
console.log('Make sure the server is running on port 5000');
console.log('Update TEST_TOKEN with a valid JWT token'); 