const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.findUserConversations(userId);
    
    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      const unreadCount = conv.unreadCount.get(userId) || 0;
      
      // Create full name from firstName and lastName
      const otherParticipantName = otherParticipant 
        ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() 
        : 'Unknown User';
      
      return {
        id: conv._id,
        name: conv.isGroupChat ? conv.groupName : otherParticipantName,
        role: conv.isGroupChat ? 'Group Chat' : otherParticipant?.role || 'User',
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        timestamp: conv.lastMessageAt ? formatTimestamp(conv.lastMessageAt) : '',
        unreadCount,
        avatar: conv.isGroupChat ? null : otherParticipant?.avatar || '',
        isGroupChat: conv.isGroupChat,
        participants: conv.participants.map(p => ({
          id: p._id,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          email: p.email,
          role: p.role,
          avatar: p.avatar
        }))
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
};

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: { $in: conversation.participants } },
        { senderId: { $in: conversation.participants }, receiverId: userId }
      ]
    })
    .populate('senderId', 'firstName lastName email role')
    .sort({ createdAt: 1 })
    .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        receiverId: userId,
        senderId: { $in: conversation.participants },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this conversation
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.senderId._id,
      senderName: `${msg.senderId.firstName || ''} ${msg.senderId.lastName || ''}`.trim(),
      content: msg.content,
      timestamp: msg.createdAt,
      isOwnMessage: msg.senderId._id.toString() === userId,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
      isRead: msg.isRead
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

// Create or get conversation between two users
const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findConversation(userId, participantId);
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        isGroupChat: false
      });
      await conversation.save();
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        participants: conversation.participants
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

// Get all users for chat (excluding current user)
const getChatUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    let query = { _id: { $ne: userId } };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email role')
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error getting chat users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Helper function to format timestamp
const formatTimestamp = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = (now - messageDate) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  createOrGetConversation,
  getChatUsers
}; 