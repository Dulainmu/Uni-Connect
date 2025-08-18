const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your_test_jwt_token'; // Replace with actual token

// Axios instance with auth header
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test functions
async function testGetConversations() {
  try {
    console.log('📋 Testing GET /chat/conversations...');
    const response = await api.get('/chat/conversations');
    console.log('✅ Conversations:', response.data);
    return response.data.conversations;
  } catch (error) {
    console.error('❌ Error getting conversations:', error.response?.data || error.message);
    return [];
  }
}

async function testGetChatUsers() {
  try {
    console.log('👥 Testing GET /chat/users...');
    const response = await api.get('/chat/users');
    console.log('✅ Chat users:', response.data);
    return response.data.users;
  } catch (error) {
    console.error('❌ Error getting chat users:', error.response?.data || error.message);
    return [];
  }
}

async function testCreateConversation(participantId) {
  try {
    console.log(`💬 Testing POST /chat/conversations with participant: ${participantId}...`);
    const response = await api.post('/chat/conversations', {
      participantId
    });
    console.log('✅ Conversation created:', response.data);
    return response.data.conversation;
  } catch (error) {
    console.error('❌ Error creating conversation:', error.response?.data || error.message);
    return null;
  }
}

async function testGetMessages(conversationId) {
  try {
    console.log(`📨 Testing GET /chat/conversations/${conversationId}/messages...`);
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    console.log('✅ Messages:', response.data);
    return response.data.messages;
  } catch (error) {
    console.error('❌ Error getting messages:', error.response?.data || error.message);
    return [];
  }
}

async function testHealthCheck() {
  try {
    console.log('🏥 Testing health check...');
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting chat API tests...');
  console.log('Make sure the server is running on port 5000');
  console.log('Update TEST_TOKEN with a valid JWT token\n');

  // Test health check first
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('❌ Server is not healthy, stopping tests');
    return;
  }

  console.log('');

  // Test getting chat users
  const users = await testGetChatUsers();
  
  console.log('');

  // Test getting conversations
  const conversations = await testGetConversations();
  
  console.log('');

  // Test creating conversation if we have users
  if (users.length > 0) {
    const firstUser = users[0];
    const conversation = await testCreateConversation(firstUser._id);
    
    console.log('');

    // Test getting messages if conversation was created
    if (conversation) {
      await testGetMessages(conversation.id);
    }
  } else {
    console.log('⚠️ No users found, skipping conversation tests');
  }

  console.log('\n✅ All API tests completed!');
}

// Run tests
runTests().catch(console.error); 