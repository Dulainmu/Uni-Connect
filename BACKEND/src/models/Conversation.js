const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: null
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying of user conversations
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

// Ensure participants array has unique values
conversationSchema.pre('save', function(next) {
  this.participants = [...new Set(this.participants)];
  next();
});

// Method to get conversation between two users
conversationSchema.statics.findConversation = function(userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] },
    isGroupChat: false
  });
};

// Method to get all conversations for a user
conversationSchema.statics.findUserConversations = function(userId) {
  return this.find({
    participants: userId
  }).populate('participants', 'firstName lastName email role')
    .populate('lastMessage')
    .populate('groupAdmin', 'firstName lastName email')
    .sort({ lastMessageAt: -1 });
};

module.exports = mongoose.model('Conversation', conversationSchema); 