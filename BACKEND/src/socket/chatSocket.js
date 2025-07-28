const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Store connected users
const connectedUsers = new Map();

// Authenticate socket connection
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize socket server
const initializeSocket = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Add user to connected users map
    connectedUsers.set(socket.userId, socket.id);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, messageType = 'text', fileUrl = null } = data;
        
        // Create new message
        const message = new Message({
          senderId: socket.userId,
          receiverId,
          content,
          messageType,
          fileUrl
        });
        
        await message.save();
        
        // Populate sender information
        await message.populate('senderId', 'name email role avatar');
        
        // Find or create conversation
        let conversation = await Conversation.findConversation(socket.userId, receiverId);
        
        if (!conversation) {
          conversation = new Conversation({
            participants: [socket.userId, receiverId],
            isGroupChat: false
          });
        }
        
        // Update conversation with last message
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        
        // Increment unread count for receiver
        const currentUnread = conversation.unreadCount.get(receiverId) || 0;
        conversation.unreadCount.set(receiverId, currentUnread + 1);
        
        await conversation.save();
        
        // Format message for frontend
        const formattedMessage = {
          id: message._id,
          senderId: message.senderId._id,
          senderName: message.senderId.name,
          content: message.content,
          timestamp: message.createdAt,
          isOwnMessage: false,
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          isRead: message.isRead
        };
        
        // Send message to sender (confirmation)
        socket.emit('message_sent', {
          ...formattedMessage,
          isOwnMessage: true
        });
        
        // Send message to receiver
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', formattedMessage);
        }
        
        // Send conversation update to both users
        const conversationUpdate = {
          conversationId: conversation._id,
          lastMessage: message.content,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount: conversation.unreadCount.get(receiverId) || 0
        };
        
        socket.emit('conversation_updated', conversationUpdate);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('conversation_updated', {
            ...conversationUpdate,
            unreadCount: conversation.unreadCount.get(receiverId) || 0
          });
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', {
          message: 'Failed to send message'
        });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stopped_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle message read status
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;
        
        // Mark messages as read
        await Message.updateMany(
          {
            receiverId: socket.userId,
            senderId: { $in: conversation.participants },
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );
        
        // Reset unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(socket.userId, 0);
          await conversation.save();
          
          // Notify other participants
          conversation.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              const participantSocketId = connectedUsers.get(participantId.toString());
              if (participantSocketId) {
                io.to(participantSocketId).emit('messages_read', {
                  conversationId,
                  readBy: socket.userId
                });
              }
            }
          });
        }
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle user status (online/offline)
    socket.on('set_status', (data) => {
      const { status } = data;
      socket.userStatus = status;
      
      // Broadcast status to all connected users
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
      
      // Broadcast offline status
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

// Get online users
const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

// Check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  isUserOnline
}; 