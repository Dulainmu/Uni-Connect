const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserConversations,
  getConversationMessages,
  createOrGetConversation,
  getChatUsers
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Get all conversations for the authenticated user
router.get('/conversations', getUserConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Create or get conversation between two users
router.post('/conversations', createOrGetConversation);

// Get all users for chat (excluding current user)
router.get('/users', getChatUsers);

module.exports = router; 